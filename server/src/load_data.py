"""
Loads the data and does a quick analysis

- make sure openpyxl is installed

Jonathan -- 28-09-'24
"""

import pandas as pd # type: ignore
import numpy as np # type: ignore

def load_data(file_path: str) -> tuple[pd.DataFrame, pd.DataFrame, float]:
    """
    Given an excel file path, this function reads the data, cleans it, and performs a quick analysis
    Args: file_path (str): The path to the excel file
    Returns: tuple[pd.DataFrame, pd.DataFrame, float]: A tuple containing the cleaned data, question statistics, and class average
    """

    def read_and_analyze_xlsx(file_path):
        df = pd.read_excel(file_path, engine='openpyxl')
        
        df.columns = df.columns.str.strip().str.lower()
        
        # rename first column to 'student_name'
        if df.columns[0] != 'student_name':
            df = df.rename(columns={df.columns[0]: 'student_name'})
        
        # extract max points (last row) and remove it from the dataframe
        max_points = df.iloc[-1, 1:].astype(float)
        df = df.iloc[:-1].copy()
        
        # clean student names
        df['student_name'] = df['student_name'].str.strip()
        
        # convert grade columns to numeric
        grade_columns = df.columns[1:]
        df[grade_columns] = df[grade_columns].apply(pd.to_numeric, errors='coerce') # replaces any non-numeric values with NaN
        
        # calculate total score and percentage for each student
        df['total_score'] = df[grade_columns].sum(axis=1)
        df['max_score'] = max_points.sum()
        df['percentage'] = (df['total_score'] / df['max_score']) * 100
        
        return df, max_points

    def analyze_questions(df, max_points):
        grade_columns = df.columns[1:-3]  # excludes 'student_name', 'total_score', 'max_score', and 'percentage'
        
        question_analysis = pd.DataFrame({
            'max_points': max_points,
            'mean': df[grade_columns].mean(),
            'median': df[grade_columns].median(),
            'min': df[grade_columns].min(),
            'max': df[grade_columns].max()
        })
        
        question_analysis['difficulty'] = 1 - (question_analysis['mean'] / question_analysis['max_points'])
        question_analysis['avg_percentage'] = (question_analysis['mean'] / question_analysis['max_points']) * 100
        
        return question_analysis


    cleaned_data, max_points = read_and_analyze_xlsx(file_path)
    question_stats = analyze_questions(cleaned_data, max_points)


    class_average = cleaned_data['percentage'].mean()

    return cleaned_data, question_stats, class_average


if __name__ == '__main__':
    cleaned_data, question_stats, class_average = load_data('data\synthetic_test_data.xlsx')
    print(cleaned_data)
    print(question_stats)
    print(class_average)
    