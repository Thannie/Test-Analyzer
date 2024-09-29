"""
Creates a synthetic dataset for testing
Jonathan -- 28-09-'24
"""


import pandas as pd # type: ignore
import numpy as np # type: ignore

# set random seed, so you always get the same sheet
np.random.seed(42)

num_students = 20
num_questions = 10


student_names = [f"Student_{i+1}" for i in range(num_students)]

question_max_points = np.random.randint(5, 21, num_questions)
question_difficulties = np.random.randint(1, 11, num_questions)

# generate grades based on question difficulties and max points
grades = []
for _ in range(num_students):
    student_grades = []
    for difficulty, max_points in zip(question_difficulties, question_max_points):
        # higher difficulty means lower chance of getting full points
        points = max(0, min(max_points, int(np.random.normal(max_points * (1 - difficulty/10), max_points/5))))
        student_grades.append(points)
    grades.append(student_grades)


df = pd.DataFrame(grades, columns=[f"Q{i+1}" for i in range(num_questions)], index=student_names)


df.loc['Max Points'] = question_max_points
df['Total'] = df.loc[student_names].sum(axis=1)

# Calculate max possible total
max_total = sum(question_max_points)
df.loc['Max Points', 'Total'] = max_total

# save to Excel file
df.to_excel("data/synthetic_test_data.xlsx")

print(df)
print(f"\nData saved to 'data/synthetic_test_data.xlsx'")
