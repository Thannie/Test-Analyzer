import axios from 'axios';
import { getRandomID } from './helpers';

const use_localhost = true
// const endpoint = 'http://localhost:8080'
var endpoint = (use_localhost&&(location.hostname === "localhost" || location.hostname === "127.0.0.1")) ? 'http://localhost:8080' : 'https://toetspws-function-771520566941.europe-west4.run.app'


class ScanPage {
  constructor(base64Image) {
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
        this.colorCorrected = response.data.output.clean;
        this.is_loading = false
        return this.colorCorrected;
    }

    async detectQrSections(){
        this.is_loading = true
        const response = await axios.post(endpoint+'/get_qr_sections', {
            Base64Image: this.croppedImage,
        });
        this.squareImage = response.data.output.image
        response.data.output.sections.forEach(e => {
            const section = new ScanSection({
                full: e.section_image,
                answer: e.section_image,
                question_number: e.data,
                is_qr_section: true
            })
            this.sections.push(section)
        });
        this.is_loading = false
        return this.colorCorrected;
    }
    async detectStudentId(){
        this.is_loading = true
        const response = await axios.post(endpoint+'/get_student_id', {
            Base64Image: this.croppedImage,
        });
        this.student_id = response.data.output
        
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
        const response = await Promise.all(unique_questions.map(async question_number => {
            const response = await axios.post(endpoint+'/link_answer_sections', {
                sections: this.sections.filter(e => e.question_number == question_number).map(section => section.answer),
            })
            return {response, question_number}
        }))
        this.questions = response.map(e => new ScanQuestion(e.response.data.output, e.question_number))

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
        this.question_number = response.data.output.selected_question;
        this.question_number_data = response.data.output
        this.is_loading = false
        return response
    }


}
class ScanQuestion {
    constructor(base64Image, question_number) {
        this.id = getRandomID()

        this.base64Image = base64Image;
        this.question_number = question_number
        this.text = null;
        this.data = null
    }


    // Extract text from the section based on the bounding box
    async extractText() {
        this.is_loading = false
        const response = await axios.post(endpoint+'/extract_text', {
            Base64Image: this.base64Image,
        });
        this.text = response.data.output.raw_text;
        this.data = response.data.output
        this.is_loading = false
        return { text: this.text };
    }

}

export {
    ScanPage,
    ScanSection,
    ScanQuestion
}