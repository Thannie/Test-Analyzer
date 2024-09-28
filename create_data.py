"""
Creates a synthetic dataset for testing
Jonathan -- 28-09-'24
"""


import pandas as pd
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)

# Generate data
num_students = 20
num_questions = 10

# Generate student names
student_names = [f"Student_{i+1}" for i in range(num_students)]

# Generate question max points (between 5 and 20)
question_max_points = np.random.randint(5, 21, num_questions)

# Generate question difficulties (1-10, where 10 is the most difficult)
question_difficulties = np.random.randint(1, 11, num_questions)

# Generate grades based on question difficulties and max points
grades = []
for _ in range(num_students):
    student_grades = []
    for difficulty, max_points in zip(question_difficulties, question_max_points):
        # Higher difficulty means lower chance of getting full points
        points = max(0, min(max_points, int(np.random.normal(max_points * (1 - difficulty/10), max_points/5))))
        student_grades.append(points)
    grades.append(student_grades)

# Create DataFrame
df = pd.DataFrame(grades, columns=[f"Q{i+1}" for i in range(num_questions)], index=student_names)

# Add max points row
df.loc['Max Points'] = question_max_points

# Add total score column
df['Total'] = df.loc[student_names].sum(axis=1)

# Calculate max possible total
max_total = sum(question_max_points)
df.loc['Max Points', 'Total'] = max_total

# Save to Excel file
df.to_excel("data/synthetic_test_data.xlsx")

print(df)
print(f"\nData saved to 'data/synthetic_test_data.xlsx'")
print(f"\nMax possible total score: {max_total}")