<template lang="pug">
v-app
    v-main
        v-tabs(v-model='selected_tab')
            v-tab(value="load") Laad
            v-tab(value="analyse" v-if="is_loaded") Analyseer
            v-tab(value="edit" v-if="is_loaded") Bewerk
        v-window(v-model='selected_tab')
            v-window-item(value="load") 
                v-row(style="max-height: calc(100dvh - 60px)")
                    v-col

                        v-file-input(
                            v-model="excel_file"
                            label="excel"
                            show-size
                        )
                        v-btn(
                            @click="loadClassData()"
                        ) Laad in 
                        p {{ excel_file }}
                    v-divider(vertical)
                    v-col
                        div(v-if="is_loaded")
                            h1 {{ test.name }}
                            v-divider
                            p vragen: {{test.questions.length}}
                            p studenten: {{test.students.length}}
                    v-divider(vertical)
                    v-col
                        div(v-if="is_loaded")

            v-window-item(value="analyse")
                //- :headers="resultHeaders"
                v-select(v-model="result_data_type" :items="['points', 'percent']")
                v-data-table(
                    :items="resultItems"
                    density="compact"
                )
                    template(v-slot:item="{ item }")
                        tr  
                            td(v-for="val in Object.values(item)") 
                                | {{ (result_data_type == "percent" && !(typeof val == 'string')) ? Math.round(val * 100) : val }}

                //- p {{ resultItems}}

                v-select(v-model="comparision_type" :items="['question', 'student']")
                apexchart(
                    width="800px"
                    height="600px"
                    :options="heatmap_options"
                    :series="heatmapData"
                )

                apexchart(
                    width="800px"
                    height="600px"
                    :options="gradechart_options"
                    :series="gradechartData"
                )
                


            v-window-item(value="edit")

</template>

<script>
// Data 
import data_classes from '@/classes'
import {  excelFileToJSON, sum } from '@/helpers'


// Components


export default {
   name: 'App',
   components: {
    
   },
   props: {
   
   },
   emits: [],
   setup() {
       
   },
   data(){
        return {
           selected_tab: 'load',

           excel_file: null,
           is_loaded: false,

           test: new data_classes.Test({}),

            // table
            result_data_type: 'points',

            // heat map
            comparision_type: 'question',
            heatmap_options: {
                chart: {
                    type: 'heatmap',
                },
                dataLabels: {
                    enabled: true,
                    formatter: function (val, opt) {
                        return Math.round(val * 1000) / 1000
                    },
                    dropShadow: {
                        // enabled: true
                    }
                },
                colors: ["#008FFB"],
                heatmap: {

                    min: 0,
                    max: 1
                },
                tooltip: {
                    theme: 'dark',
                    x: {
                        show: true,
                        formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
                            return 'Cor(item1, item2) = '
                        }
                    },
                    y: {
                        title: {
                            formatter: function () {
                                return ''
                            }
                        }
                    }
                }
            },
            gradechart_options: {
                chart: {
                    type: 'line',
                },
                stroke: {
                    curve: 'straight',
                },
                tooltip: {
                    theme: 'dark'
                }

            }

       }
   },
   computed: {
        heatmapData(){
            const series = []

            switch (this.comparision_type) {
                case "question":
                    this.test.questions.sort((a,b) => a.question_number - b.question_number).forEach(question1 => {
                        const serie = {
                            name: 'Q'+question1.question_number,
                            data: []
                        }

                        this.test.questions.sort((a,b) => a.question_number - b.question_number).forEach(question2 => {
                            if (question1.id == question2.id) {
                                var result = 1
                            } else {
                                var result = this.test.results.getTypeCorrelation(
                                    "question",
                                    question1.id,
                                    question2.id
                                )
                            }

                            serie.data.push(result)
                        })

                        series.push(serie)
                    })
                    break;
                case "student":

                default:
                    break;
            }

            
            return series
            
        },
        gradechartData(){
            const grade_series = [...Array(20).keys()].map(e => e * 0.5);

            return [{
                type: 'line',
                data: grade_series.map(e => {return  {
                    x: Math.round(e / 10) * 10,
                    y: this.test.grade_formula.method(e / 10)
                }})
            }]

        },
        // resultHeaders(){
        //     return {

        //     }
        // },
        resultItems(){
            // student as row
            return this.test.getJsonRows(this.result_data_type)
            
        },
   },
   methods: {
        async loadClassData(){
            const data = await excelFileToJSON(this.excel_file)

            const questions = []

            console.log(data)
            Object.keys(data.Sheet1[data.Sheet1.length - 1]).forEach(key => {
                if (key.startsWith("Q")){
                    const max_points = data.Sheet1[data.Sheet1.length - 1][key]

                    questions.push(new data_classes.Question({
                        question_number: Number(key.replaceAll('Q', '')),
                        total_points: max_points
                    }))
                }
            })

            const students = []
            const STUDENT_ID_KEY = '__EMPTY'

            const result_bundle = new data_classes.ResultBundle({})
            data.Sheet1.forEach(row => {
                const student_id = row[STUDENT_ID_KEY]
                if (student_id =="Max Points"){return}
                const current_student = new data_classes.Student({
                    id: student_id
                })
                students.push(current_student)

                Object.entries(row).forEach(([question_id, points]) => {
                    if (question_id.startsWith('Q')){
                        const result = new data_classes.Result({
                            question: questions.find(e => e.question_number == Number(question_id.replaceAll('Q', ''))) || new data_classes.Question({}),
                            student: current_student,
                            points: points
                        })

                        result_bundle.addResult(result)
                    }
                })
            })


            this.test = new data_classes.Test({
                results: result_bundle,
                name: "ingeladen toets",
                questions: questions,
                students: students
            })
            this.is_loaded = true
            console.log(this.test)
        }
   },
   watch: {
        excel_file(){
            this.loadClassData
        }
   },
   // created() {
   
   // },
   mounted() {
   
   },
   
   
}
</script>
   
<style scoped>
   
</style>
