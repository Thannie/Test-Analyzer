<template lang="pug">
v-app
    v-main
        v-tabs(v-model='selected_tab')
            v-tab(value="load") Laad
            v-tab(value="analyse") Analyseer
            v-tab(value="edit") Bewerk
        v-window(v-model='selected_tab')
            v-window-item(value="load") 
                v-file-input(
                    v-model="excel_file"
                    label="excel"
                    show-size
                )
                v-btn(
                    @click="loadClassData()"
                ) Laad in 
                p {{ excel_file }}
            v-window-item(value="analyse")
                v-select(v-model="comparision_type" :items="['question', 'student']")
                apexchart(
                    width="800px"
                    height="600px"
                    :options="heatmap_options"
                    :series="heatmapData"
                )
            v-window-item(value="edit")

</template>

<script>
// Data 
import data_classes from '@/classes'
import {  excelFileToJSON } from '@/helpers'


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

            comparision_type: 'question',
            heatmap_options: {
                chart: {
                    type: 'heatmap',
                },
                dataLabels: {
                    enabled: true
                },
                colors: ["#008FFB"],
                heatmap: {

                    min: -1,
                    max: 1
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
            
        }
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

            const STUDENT_ID_KEY = '__EMPTY'

            const result_bundle = new data_classes.ResultBundle({})
            data.Sheet1.forEach(row => {
                Object.entries(row).forEach(([question_id, points]) => {
                    if (question_id.startsWith('Q')){
                        const result = new data_classes.Result({
                            question: questions.find(e => e.question_number == Number(question_id.replaceAll('Q', ''))) || new data_classes.Question({}),
                            student: new data_classes.Student({id: row[STUDENT_ID_KEY]}),
                            points: points
                        })

                        result_bundle.addResult(result)
                    }
                })
            })


            this.test = new data_classes.Test({
                results: result_bundle,
                name: "ingeladen toets",
                questions: questions
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
