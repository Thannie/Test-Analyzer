
from numbers import Number
import math

class QuestionResult:
    def __init__(self, id=-1, total_points:Number=1, points:Number=1) -> None:
        self.id = id
        self.total_points = total_points
        self.points =   points
    
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
    


    