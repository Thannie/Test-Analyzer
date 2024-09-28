import pandas as pd # type: ignore
import numpy as np # type: ignore

def read_and_analyze_xlsx(file_path):
    # Read the Excel file
    df = pd.read_excel(file_path, engine='openpyxl')
    
    # Clean column names
    df.columns = df.columns.str.strip().str.lower()
    
    # Rename first column to 'student_name' if it's not already
    if df.columns[0] != 'student_name':
        df = df.rename(columns={df.columns[0]: 'student_name'})
    
    # Extract max points (last row) and remove it from the dataframe
    max_points = df.iloc[-1, 1:].astype(float)
    df = df.iloc[:-1].copy()
    
    # Clean student names
    df['student_name'] = df['student_name'].str.strip()
    
    # Convert grade columns to numeric, replacing any non-numeric values with NaN
    grade_columns = df.columns[1:]
    df[grade_columns] = df[grade_columns].apply(pd.to_numeric, errors='coerce')
    
    # Calculate total score and percentage for each student
    df['total_score'] = df[grade_columns].sum(axis=1)
    df['max_score'] = max_points.sum()
    df['percentage'] = (df['total_score'] / df['max_score']) * 100
    
    return df, max_points

def analyze_questions(df, max_points):
    grade_columns = df.columns[1:-3]  # Excludes 'student_name', 'total_score', 'max_score', and 'percentage'
    
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


file_path = "data\synthetic_test_data.xlsx"
cleaned_data, max_points = read_and_analyze_xlsx(file_path)
question_stats = analyze_questions(cleaned_data, max_points)

print("Cleaned student data:")
print(cleaned_data)
print("\nQuestion analysis:")
print(question_stats)


class_average = cleaned_data['percentage'].mean()
print(f"\nClass average: {class_average:.2f}%")