from numbers import Number
import math


class Question:    
    def __init__(self, total_points:Number, question_number: Number) -> None:
        self.total_points = total_points
        self.question_number = question_number


# question is a reference
# so a user can easily change the points of one question on alle results
class QuestionResult:
    def __init__(self, id=-1, question:Question=Question(1), points:Number=1) -> None:
        self.id = id
        self.question = question
        self._points = points  # _points is a private variable, to avoid accidentally changing the points of the question

    # use @property to easily excess the total points of the question
    # qr: QuestionResult
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
        return self._points
    
    # ensure the points are between 0 and total points
    @points.setter
    def points(self, value: Number) -> None:
        if value < 0 or value > self.total_points:
            raise ValueError("Points must be between 0 and total points")
        self._points = value

    def percentage(self) -> float:
        """Return the percentage of the points"""
        return (self.points / self.total_points) * 100
    
    
# student result or question result
class QuestionBundle: 
    def __init__(self, question_results: list[QuestionResult] = []) -> None:
        self.question_results = question_results
        
    def add_result(self, question_result: QuestionResult) -> None:
        self.question_results.append(question_result)
        
    def average_precentage(self) -> float:
        if not self.question_results:
            # to avoid division by zero
            return 0.0
        return sum([result.percentage() for result in self.question_results]) / len(self.question_results)
    
    def standard_deviation(self) -> float:
        average = self.average_precentage()
        return math.sqrt((sum([math.pow(result.percentage() - average, 2) for result in self.question_results ])) / (len(self.question_results) - 1))
