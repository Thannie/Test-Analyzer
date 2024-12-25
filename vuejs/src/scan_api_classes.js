import axios from 'axios';
import { getRandomID } from './helpers';
import { globals } from '@/main'
const use_localhost = true
// const endpoint = 'http://localhost:8080'
var endpoint = (use_localhost&&(location.hostname === "localhost" || location.hostname === "127.0.0.1")) ? 'http://localhost:8080' : 'https://toetspws-function-771520566941.europe-west4.run.app'

import saved_output from '@/saved_output.json'

const apiRequest = async (route, data) => {

    const response = await axios.post(endpoint+route, data);
    
    if (response.data
    && response.data.output){
        return response.data.output
    }
    console.warn('Request error', response)

    return response
}

class ContextData {
    constructor({
        contexts= {},
        questions= {},
        rubrics= {},
    }){
        this.contexts = contexts
        this.questions = questions
        this.rubrics = rubrics
    }
    getQuestion(id){
        return this.questions[id] || ""
    }
    getRubric(id){
        return this.rubrics[id] || ""
    }
    getContext(id){
        return this.contexts[id] || ""
    }
}


class ScanPage {
  constructor(base64Image, context_data=new ContextData({})) {
    this.base64Image = base64Image;
    this.id = getRandomID()
    this.is_loading = false
    this.student_id = null;
    this.colorCorrected = null;
    this.redPenExtracted = null;
    this.squareImage = null;
    this.squareData = [];
    this.sections = [];
    this.questions = [];
    this.is_loading_all = false;
    this.total_result = {}
    this.context_data = context_data
  }
    generateRandomId() {
        return Math.random().toString(36).substring(2, 15);
    }

    async cropImage() {
        try {
            this.is_loading = true
            const response = await axios.post(endpoint+'/crop', {
                Base64Image: this.base64Image
            });
            if (response.data && response.data.output) {
                this.croppedImage = response.data.output;
            } else {
                console.error('Error cropping image:', response.data);
            }
            this.is_loading = false
        } catch (error) {
            console.error('API call to crop image failed:', error);
        }
    }
    // Color correction and extraction of red pen marks
    async colorCorrect() {
        this.is_loading = true
        const response = await axios.post(endpoint+'/extract_red_pen', {
            Base64Image: this.croppedImage,
        });
        console.log(response)
        this.colorCorrected = response.data.output.clean;
        this.is_loading = false
        return this.colorCorrected;
    }

    async detectQrSections(){
        this.is_loading = true
        const response = await axios.post(endpoint+'/get_qr_sections', {
            Base64Image: this.croppedImage,
        });
        this.squareImage = response.data.output?.image || null
        response.data?.output?.sections?.forEach(e => {
            const section = new ScanSection({
                full: e.section_image,
                answer: e.section_image,
                question_number: e.data,
                is_qr_section: true
            })

            this.sections.push(section)
        });
        console.log(response)

        this.is_loading = false
        return this.colorCorrected;
    }
    async detectStudentId(){
        this.is_loading = true
        const response = await axios.post(endpoint+'/get_student_id', {
            Base64Image: this.croppedImage,
        });
        this.student_id = response.data.output.result
        
        this.is_loading = false
    }
    // Detect squares on the image
    async detectSquares() {
        this.is_loading = true
        const response = await axios.post(endpoint+'/detect_squares', {
            Base64Image: this.colorCorrected,
        });
        this.squareData = response.data.output.data;
        this.squareImage = response.data.output.image
        this.is_loading = false
        return this.squareData;
    }
    // calculate everything
    async scanPage() {
        this.is_loading_all = true
        console.log('started scan page: ', this)
        const response = await axios.post(endpoint+'/scan_page', {
            Base64Image: this.base64Image,
        });
        console.log(response)
        this.total_result = response.data.output;
        this.is_loading_all = false
        return this.total_result;
    }
    // Create sections based on square data
    async createSections() {
        this.is_loading = true
        const response = await axios.post(endpoint+'/extract_sections', {
            Base64Image: this.croppedImage,
            square_data: this.squareData
        });
        this.sections = response.data.output.sections.map(section => new ScanSection({
            full: section.full, 
            section_finder: section.section_finder, 
            question_selector: section.question_selector, 
            answer: section.answer
        }));
        this.is_loading = false
    }

    // Extract text from sections, turning them into Question objects if they match the criteria
    async extractQuestions() {
        this.is_loading = true
        await Promise.all(this.sections.map(section => section.extractQuestion()))
        this.is_loading = false
    }
    // Link with other answer sections
    async linkAnswers() {
        this.is_loading = true
        const unique_questions = [...new Set(this.sections.map(e => e.question_number))].filter(e => e != 0)
        console.log(unique_questions)
        const response = await Promise.all(unique_questions.map(async question_number => {
            const response = await axios.post(endpoint+'/link_answer_sections', {
                sections: this.sections.filter(e => e.question_number == question_number).map(section => section.answer),
            })
            console.log(response)
            return {response, question_number}
        }))
        this.questions = response.map(e => new ScanQuestion(e.response.data.output, e.question_number, this))

        // this.linkedAnswersImage = response.data.output;
        this.is_loading = false
    }
    async extractText(){
        this.is_loading = true
        await Promise.all(this.questions.map(question => question.extractText()))
        this.is_loading = false
    }

}


class ScanSection {
    constructor({
        full=null,
        section_finder=null,
        question_selector=null,
        answer=null,
        question_number=null,
        question_number_data=null,
        is_qr_section=false
    }) {
        this.id = getRandomID()
        this.is_loading = false
        this.full = full
        this.section_finder = section_finder
        this.question_selector = question_selector
        this.answer = answer
        this.is_qr_section = is_qr_section

        this.question_number = question_number
        this.question_number_data = question_number_data
    }

    async extractQuestion(){
        this.is_loading = true
        const response = await axios.post(endpoint+'/question_selector_info', {
            Base64Image: this.question_selector,
        });
        console.log(response)
        this.question_number = response.data.output.most_certain_checked_number;
        this.question_number_data = response.data.output
        this.is_loading = false
        return response
    }


}
class ScanQuestion {
    constructor(base64Image, question_number, page) {
        this.id = getRandomID()

        this.base64Image = base64Image;
        this.question_number = question_number
        this.text = null;
        this.data = null
        this.page = page
    }


    // Extract text from the section based on the bounding box
    async extractText() {
        this.is_loading = false
        const response = await axios.post(endpoint+'/extract_text', {
            Base64Image: this.base64Image,
            questionText: this.page.context_data.getQuestion(this.question_number.toString()),
            rubricText: this.page.context_data.getQuestion(this.question_number.toString()),
            contextText: this.page.context_data.getContext(this.question_number.toString()),

        });
        console.log(response)
        this.text = response.data.output.result.correctly_spelled_text;
        this.data = response.data.output
        this.is_loading = false
        return { text: this.text };
    }

}

class Test {
    constructor({
        id=getRandomID(),

        files={
            test: {
                raw: null,
                blob: null,
                data: [],
            },
            rubric: {
                raw: null,
                blob: null,
                data: [],
            },
            students: {
                raw: null,
                blob: null,
                data: [],
            },
        },
        questions=[], 
        students=[],
        targets=[],
        pages=[],

        test_data_result=null,
    }){
        this.id = id
        this.files = files

        this.pages = pages

        this.questions = questions.map(e => new Question(e))
        this.students = students.map(e => new Student(e))
        this.targets = targets.map(e => new Target(e))
        this.test_data_result=test_data_result
    }
    async loadDataFromPdf(field_type){
        this.files[field_type].data = await globals.$extractTextAndImages(this.files[field_type].raw)
        console.log(this.files[field_type].data)
    }
    async loadTestStructure(){
        console.log(this)
        const request_text = `
        Je krijg een toets en de antwoorden. Jouw taak is om die zo goed en precies mogelijk in een digitaal formaat om te zetten.
        je hoeft niets te doen met de context om een vraag. Het gaat alleen om de vraag zelf
        Extraheer uit de teksten de vragen:
        vraag tekst: de exacte tekst van de vraag
        antwoord tekst: als er in het antwoordmodel een antwoord staat, neem die dan exact over. Laat anders leeg
        question_id: dit is het nummer van de vraag, dit kan ook een samenstelling zijn van nummers en letters: 1a, 4c enz.
        points: Haal uit de rubric bij elke vraag de rubric punten, als er geen punten in de rubric staan mag je zelf punten bedenken.
        elk punt heeft:
            een naam (point_name) met in 1 of 2 woorden waar die punt overgaat
            een tekst (point_text) met daarin de exacte uitleg van dit punt
            een nummber (point_index) welk punt dit is, bij deze vraag, start bij 0
            een gewicht (point_weight) voor hoeveel punten deze rubricpoint mee telt
            leerdoel (target_name) het leerdoel waar dit punt bij hoort
        
        Daarmaast moet je bij de hele toets een paar overkoepelende leerdoelen bedenken.
        Elk leerdoel heeft een korte naam: dit is ook de naam die bij elk punt waar dit leerdoel het meest bij hoort wordt ingevuld
        en een uitleg (explanation) met daarin exact wat dit leerdoel inhoud.


        geeft de resultaten in de taal van de gegeven toets(vaak zal dat Nederlands zijn)

        Houd je altijd aan het gegeven schema

        Hier volgt de toets:
            
        `

        const test_data = this.files.test.data
        const rubric_data = this.files.rubric.data


        const result = saved_output

        // const result = await apiRequest('/test-data', {
        //     requestText: request_text,
        //     testData: {
        //         toets: test_data,
        //         rubric: rubric_data
        //     }
        // })



        console.log(result)
        this.test_data_result = result
        this.loadTestData()
    }
    loadTestData(){
        this.targets = []

        this.test_data_result.targets.forEach(e => {
            this.addTarget(e)
        })
        this.questions = []

        this.test_data_result.questions.forEach(e => {
            this.addQuestion(e)
        })
    }
    addTarget(target){


        this.targets.push(new Target({
            test: this,
            ...target
        }))
    }
    addQuestion(question){
        if (question.question_id){
            question.rubric = question.points

            this.questions.push(new Question({
                test: this,
                ...question,
            }))
        } else {
            console.log('Could not find question id for: ', question)
        }
    }
}

class Question {
    constructor({
        test=new Test({}),
        id=getRandomID(),
        question_id="",
        question_text="",
        answer_text="",
        rubric=[],
    }){
        this.test = test

        this.id = id
        this.question_id = question_id
        this.question_text = question_text
        this.answer_text = answer_text

        rubric.forEach(e => this.addRubricPoint(e))
    }
    addRubricPoint(point){
        const target = this.test.targets.find(e => e.target_name == point.target_name)

        
        this.rubric.push(new RubricPoint({
            question:this,
            ...point,
            target
        }))
    }
}

class RubricPoint {
    constructor({
        question=new Question({}),
        id=getRandomID(),
        point_text="",
        point_name="",
        point_weight=1,
        target=new Target({}),
    }){
        this.question = question

        this.id = id
        this.point_text = point_text
        this.point_name = point_name
        this.point_weight =  point_weight
        this.target = target
    }
}

class Target {
    constructor({
        test=new Test({}),
        id=getRandomID(),
        target_name="",
        explanation="",
    }){
        this.test = test

        this.id = id
        this.target_name = target_name
        this.explanation = explanation
    }
}

class Student {
    constructor({
        test=new Test({}),
        id=getRandomID(),
        student_id="",
        student_results=[]
    }){ 
        this.test = test
        this.id = id
        this.student_id = student_id
        this.student_results = student_results
    }
}

class StudentResult {
    constructor({
        id=new Test({}),
        student=new Student({}),
        question=new Question({}),
        result=[],
    }) {
        this.id = id
        this.student = student
        this.question = question
        this.result = result
    }
}

class StudentRubricResult {
    constructor({
        id=getRandomID(),
        student_result=new StudentResult({}),
        has_point=null,
        feedback=""
    }){
        this.id = id
        this.student_result = student_result
        this.has_point = has_point
        this.feedback = feedback
    }
}









export {
    ScanPage,
    ScanSection,
    ScanQuestion,
    ContextData,


    Test,
    Question,
    RubricPoint,
    Target,
    Student,
    StudentResult,
    StudentRubricResult,
}