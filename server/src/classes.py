
from numbers import Number
import math


class Question:
    total_points: Number
    
    def __init__(self, total_points:Number) -> None:
        self.total_points

# question is a reference
# so a user can easily change the points of one question on alle results
class QuestionResult:
    
    def __init__(self, id=-1, question:Question=Question(1), points:Number=1) -> None:
        self.id = id
        self.question = question
        self.points =   points
        
    @getattr
    def total_points(self) -> Number:
        return self.question.total_points
    
    def percentage(self) -> float:
        return self.points / self.total_points
    
    
    
# student result or question result
class QuestionBundle: 
    def __init__(self, question_results: list[QuestionResult] = []) -> None:
        self.question_results = question_results
        
    def add_result(self, question_result: QuestionResult) -> None:
        self.question_results.append(question_result)
        
    def average_precentage(self) -> float:
        return sum([result.percentage() for result in self.question_results]) / len(self.question_results)
    
    def standard_deviation(self) -> float:
        average = self.average_precentage()
        return math.sqrt((sum([math.pow(result.percentage() - average, 2) for result in self.question_results ])) / (len(self.question_results) - 1))
    


    