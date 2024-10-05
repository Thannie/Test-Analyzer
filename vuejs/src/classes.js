// Importing required libraries (not needed in the same way as Python)
import { v4 as uuidv4 } from 'uuid' 


const data_classes = {}

// Standard Deviation function
function standardDeviation(data) {
    const average = data.reduce((sum, val) => sum + val, 0) / data.length;
    return Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / (data.length - 1));
}
data_classes.standardDeviation = standardDeviation

// Correlation function
function correlation(list1, list2) {
    const n = list1.length;
    if (list1.length !== list2.length || n <= 1) return null;

    const list1Mean = list1.reduce((sum, val) => sum + val, 0) / n;
    const list2Mean = list2.reduce((sum, val) => sum + val, 0) / n;

    const cov = list1.reduce((sum, val, i) => sum + (val - list1Mean) * (list2[i] - list2Mean), 0) / (n - 1);
    
    const list1Stdev = standardDeviation(list1);
    const list2Stdev = standardDeviation(list2);
    
    return cov / (list1Stdev * list2Stdev);
}
data_classes.correlation = correlation

// GradeFormula class
class GradeFormula {
    constructor(id = uuidv4(), name = "Method name", method = (points, total) => (9 * points / total + 1)) {
        this.id = id;
        this.name = name;
        this.method = method;
    }
}
data_classes.GradeFormula = GradeFormula

// Question class
class Question {
    constructor({total_points, question_number, id = uuidv4(), sections = []}) {
        this.id = id;
        this.question_number = question_number;
        this.original_points = total_points;
        this.sections = sections;
        this.total_points = total_points; // changed by user
    }
}
data_classes.Question = Question

class Student {
    constructor({id = uuidv4()}){
        this.id = id
    }
}
data_classes.Student = Student

// Result class
class Result {
    constructor({question = new Question(), student = {}, points = 1, id = uuidv4()}) {
        this.id = id;
        this.question = question;
        this.student = student;
        this._points = points; // private variable
    }

    get total_points() {
        return this.question.total_points;
    }

    get question_number() {
        return this.question.question_number;
    }

    get points() {
        return this._points;
    }

    set points(value) {
        this._points = value; // Ensure points are set
    }

    percentage() {
        return this.points / this.total_points;
    }
}
data_classes.Result = Result

// ResultBundle class
class ResultBundle {
    constructor({
        results = [], 
        id = uuidv4(), 
        test = {}
    }) {
        this.id = id;
        this.test = test;
        this.results = results;
    }

    [Symbol.iterator]() {
        return this.results[Symbol.iterator]();
    }

    get grade() {
        return this.test.gradeFormula.method(this.points, this.total_points);
    }

    get points() {
        return this.results.reduce((sum, result) => sum + result.points, 0);
    }

    get total_points() {
        return this.results.reduce((sum, result) => sum + result.total_points, 0);
    }

    addResult(result){
        this.results.push(result)
    }

    getStudentResults(student_id) {
        return new ResultBundle({
            results: this.results.filter(result => result.student.id === student_id),
            test: this.test
        });
    }

    getQuestionResults(question_id) {
        return new ResultBundle({
            results: this.results.filter(result => result.question.id === question_id),
            test: this.test
        });
    }

    getSectionResults(sectionId) {
        return new ResultBundle({
            results: this.results.filter(result => result.question.sections.some(section => section.id === sectionId)),
            test: this.test
        });
    }

    addResult(questionResult) {
        this.results.push(questionResult);
    }

    averagePercentage() {
        if (!this.results.length) return 0.0;
        return this.results.reduce((sum, result) => sum + result.percentage(), 0) / this.results.length;
    }

    standardDeviation() {
        return standardDeviation(this.results.map(result => result.percentage()));
    }

    getTypeCorrelation(id_type, id1, id2) {
        let results1, results2, func;
        if (id_type === "student") {
            results1 = this.getStudentResults(id1).results;
            results2 = this.getStudentResults(id2).results;
            func = (target, current) => current.question.id === target.question.id;
        } else if (id_type === "question") {
            results1 = this.getQuestionResults(id1).results;
            results2 = this.getQuestionResults(id2).results;
            func = (target, current) => current.student.id === target.student.id;
        } else if (id_type === "section") {
            results1 = this.getSectionResults(id1).results;
            results2 = this.getSectionResults(id2).results;
            func = (target, current) => current.question.id === target.question.id;
        } else {
            return null;
        }
        const relatedList = [];

        for (const result of results1) {
            const answers = results2.filter(current => func(result, current));
            if (answers.length === 0) continue;
            relatedList.push([result, answers[0]]);
        }

        const list1 = relatedList.map(relation => relation[0]);
        const list2 = relatedList.map(relation => relation[1]);

        const value1 = list1.map(x => x.percentage());
        const value2 = list2.map(x => x.percentage());

        return correlation(value1, value2);
    }

    getTypeCorrelations(id_type, id1, id2) {
        // Implementation here...
    }
}
data_classes.ResultBundle = ResultBundle


// Section class
class Section {
    constructor({id = uuidv4(), name = "", description = ""}) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
}
data_classes.Section = Section

// Test class
class Test {
    constructor({
        id = uuidv4(), 
        name = "", 
        results = new ResultBundle({}), 
        grade_formula = new GradeFormula({}), 
        questions=[]
    }) {
        this.id = id;
        this.name = name;
        this.results = results;
        this.original_grade_formula = grade_formula;
        this.grade_formula = grade_formula; // changed by user
        this.questions = questions
    }
}
data_classes.Test = Test

// Example usage
export default data_classes