from numbers import Number
import math
import uuid

# fix not referenced

class StatisticCalculator:
    pass

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

# used to have control over how a score is calculated
class GradeFormula:
    def __init__(self, id=uuid.uuid4(), name:str="Method name", method:function=(lambda points, total: 9*points/total+1)) -> None:
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
        average = self.average_precentage()
        return math.sqrt((sum([math.pow(result.percentage() - average, 2) for result in self.results ])) / (len(self.results) - 1))

    def __iter__(self):
        return self.results

# used for statistic calculations
class StatisticCalculator:
    def __init__(self) -> None:
        pass
    
    def get_covariation():
        pass
    
    def get_correlation():
        pass

    def get_correlations() -> list[dict[str, str|float]]:
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
