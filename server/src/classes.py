from numbers import Number
import math
import uuid
from typing import Callable

# fix not referenced

class Question:
    pass

class Student:
    pass
class Section:
    pass

class Test:
    pass

class ResultBundle: 
    pass

class Result:
    pass

class StudentResult:
    pass

class GradeFormula:
    pass

class Test:
    pass

def standard_deviation(data) -> float:
    average = sum(data) / len(data)
    return math.sqrt((sum([math.pow(val - average, 2) for val in data ])) / (len(data) - 1))

# list1[index] and list2[index] are related datapoints
def correlation(list1:list[float], list2:list[float]) -> float:
    n = len(list1)
    if len(list1) != len(list2) or n <= 1: return None
    
    list1_mean = sum(list1) / len(list1)
    list2_mean = sum(list2) / len(list2)
    
    # https://en.wikipedia.org/wiki/Covariance
    cov = sum([(list1[i] - list1_mean)*(list2[i] - list2_mean) for i in range(n)]) / (n - 1)

    list1_stdev = standard_deviation(list1)
    list2_stdev = standard_deviation(list2)
    
    cor = cov / (list1_stdev * list2_stdev)
    
    return cor


# used to have control over how a score is calculated
class GradeFormula:
    def __init__(self, id=uuid.uuid4(), name:str="Method name", method:Callable=(lambda points, total: 9*points/total+1)) -> None:
        self.id = id
        self.name = name
        self.method = method

# a single point result
class Result:
    def __init__(self, question:Question=Question(), student:Student=Student(), points:Number=1, id=uuid.uuid4()) -> None:
        self.id = id
        self.question = question
        self.student = student
        self.points = points  

    # use @property to easily excess the total points of the question
    # qr: Result
    # qr.total_points gives the total points of the question  
    @property
    def total_points(self) -> Number:
        return self.question.total_points
    
    @property
    def question_number(self) -> Number:
        return self.question.question_number
    
    # return the points of the question, with .points
    # cause points is points is a private variable
    @property
    def points(self) -> Number:
        return self.points
    
    # ensure the points are between 0 and total points
    @points.setter
    def points(self, value: Number) -> None:
        self._points = value

    def percentage(self) -> float:
        """Return the fraction of the points"""
        return (self.points / self.total_points)
    
    

# student result or question result or test result
class ResultBundle: 
    def __init__(self, results: list[Result] = [], id:Number=uuid.uuid4(), test: Test=Test()) -> None:
        self.id = id
        self.test = test
        self.results = results
        
    def __iter__(self):
        return self.results
    
    @property
    def grade(self):
        return self.test.grade_formula.method(self.points, self.total_points)

    @property
    def points(self):
        return sum([result.points for result in  self.results])

    @property
    def total_points(self):
        return sum([result.total_points for result in  self.results])
    
    def get_student_results(self, student_id) -> ResultBundle:
        return ResultBundle(
            results=[x for x in self.results if x.student.id == student_id],
            test=self.test
        ) 
        
    def get_question_results(self, question_id) -> ResultBundle:
        return ResultBundle(
            results=[x for x in self.results if x.question.id == question_id],
            test=self.test
        ) 
        
    def get_section_results(self, section_id) -> ResultBundle:
        return ResultBundle(
            results=[x for x in self.results if section_id in [section.id for section in x.question.sections]],
            test=self.test
        ) 
    
    def add_result(self, question_result: Result) -> None:
        self.results.append(question_result)
        
    def average_precentage(self) -> float:
        if not self.results:
            # to avoid division by zero
            return 0.0
        return sum([result.percentage() for result in self.results]) / len(self.results)
    
    def standard_deviation(self) -> float:
        return standard_deviation([result.get_percentage() for result in self.results])

    


    # should be called on a full test
    # to see wich student have around the same answers
    # wich questions are of the same level
    # same for secitons
    def get_type_correlation(self, id_type:str, id1, id2) -> float:

        results1 = []
        results2 = []            
        
        # if you want to compare two questions (b and c) you need to make an array like this
        # [(student_a_question_b, student_a_question_c), (student_b_question_b, student_c_question_c), ...]
        
        # if you want to compare two students (a and b) you need to make an array like this
        # [(student_a_question_a, student_b_question_a), (student_a_question_b, student_b_question_b), ...]

        # don't what to edit the actial list
        if (id_type == "student"):
            results1 = self.get_student_results(id1) 
            results2 = self.get_student_results(id2)
            # compare questions of two students
            func = lambda target, current: current.question.id == target.question.id
            
        elif (id_type == "question"):
            results1 = self.get_question_results(id1) 
            results2 = self.get_question_results(id2)
            func = lambda target, current: current.student.id == target.student.id

        # DONT USE I DONT UNDERSTAND
        elif (id_type == "section"):
            results1 = self.get_question_results(id1) 
            results2 = self.get_question_results(id2)
            func = lambda target, current: current.question.id == target.question.id
        else: return None

        related_list = []
        
        for result in results1:
            
            answers = [x for x in results2 if func(result, x)]
            
            if (len(answers) == 0 ): continue
            
            related_list.append((result, answers[0]))
        

        list1 = []
        list2 = []
        for relation in related_list:
            list1.push(relation[0])
            list2.push(relation[1])
        
        value1 = [x.get_percentage() for x in list1]
        value2 = [x.get_percentage() for x in list2]
        
        cor = correlation(value1, value2)

        return cor

    def get_type_correlations(self, id_type:str, id1, id2) -> list[dict[str, str|float]]:
        pass


# competency, or questions over paragraph have this
class Section:
    def __init__(self, id:uuid.UUID=uuid.uuid4(), name:str="", description:str="") -> None:
        self.id = id
        self.name = name
        self.description = description
        

# question is a reference
# so a user can easily change the points of one question on alle results
class Question:    
    def __init__(self, 
        total_points:Number, 
        question_number: Number, 
        id:Number=uuid.uuid4(),
        sections:list[Section]=[]
        # question_text:str=""
    ) -> None:
        self.id = id
        self.question_number = question_number
        self.original_points = total_points
        self.sections = sections
        # self.question_text = question_text
        
        # changed by user
        self.total_points = total_points
        

class Test:
    id: uuid.UUID
    name: str
    results: ResultBundle
    grade_formula: GradeFormula
    def __init__(
        self, 
        id:uuid.UUID=uuid.uuid4(), 
        name:str="", 
        results:ResultBundle=ResultBundle(),
        grade_formula:GradeFormula=GradeFormula()
    ) -> None:
        self.id = id
        self.name = name
        self.results = results
        self.original_grade_formula = grade_formula
        # changed by user
        self.grade_formula = grade_formula

print(correlation(
    [1,2,3,4,5],
    [1,2,3,2,4]
))