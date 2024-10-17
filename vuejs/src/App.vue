<template lang="pug">
v-app
    v-main
        v-tabs(v-model='selected_tab')
            v-tab(value="load") Laad
            v-tab(value="analyse" v-if="is_loaded") Analyseer
            v-tab(value="edit" v-if="is_loaded") Bewerk
        v-window(v-model='selected_tab' style="height: calc(100vh - 48px); position: relative")
            v-window-item(value="load") 
                v-row(style="max-height: calc(100dvh - 60px)")
                    v-col.v-col-12.v-col-sm-4

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
                    v-col.v-col-12.v-col-sm-4
                        div(v-if="is_loaded")
                            h1 {{ test.name }}
                            v-divider
                            p vragen: {{test.questions.length}}
                            p studenten: {{test.students.length}}
                            v-divider
                            v-list(v-model="selected_question_number" density="compact")
                                v-list-item(
                                    v-for="(question, i) in test.questions"
                                    :key="question.question_number"
                                    @click="selected_question_number = question.question_number"
                                )   
                                    template(v-slot:prepend)
                                        v-list-item-action(start)
                                            v-checkbox(readonly density="compact" :modelValue="question.question_number == selected_question_number")

                                    v-list-item-title Vraag {{ question.question_number }} 
                                        
                                    ul.pl-5()
                                        li(v-for="section in question.sections") {{ section.name }}

                                    
                    v-divider(vertical)
                    v-col.v-col-12.v-col-sm-4
                        div(v-if="is_loaded && selected_question ")
                            h2 Vraag {{ selected_question.question_number }}
                            v-divider
                            h4 Leerdoelen:
                            v-list(density="compact")
                                v-list-item(v-for="(section,i) in sections")
                                    template(v-slot:prepend)
                                        v-list-item-action(start)
                                            v-checkbox(
                                                readonly 
                                                density="compact" 
                                                :modelValue="selected_question.sections.map(e => e.id).includes(section.id)"
                                                @click="clickSectionCheckbox(section)"
                                            )

                                    v-list-item-title 
                                        v-text-field(
                                            class="mt-2"
                                            v-model="sections[i].name" 
                                            label="Naam leerdoel"
                                            density="compact"
                                            variant="outlined"
                                        )
                                        
                                    template(v-slot:append)
                                        v-icon(icon="mdi-delete" @click="deleteSection(section)" color="red")
                                    
                                    v-list-item-subtitle 
                                        v-text-field(
                                            class="mt-2"
                                            v-model="sections[i].beschrijving" 
                                            label="Beschrijving leerdoel"
                                            density="compact"
                                            variant="outlined"
                                        )
                                        
                                    
                            v-btn(
                                prepend-icon="mdi-plus"
                                @click="sections.push(new data_classes.Section({}))"
                            ) Nieuw leerdoel
                            
            v-window-item(value="analyse").mh-100
                v-row(no-gutters).h-100
                    v-col(style="max-width: 200px")
                        v-list()
                            v-list-item(
                                title="Type analyse"
                            )
                            v-divider
                            
                            v-list-item(
                                v-for="item in [{'title': 'Student', 'value': 'student'}, {'title': 'Vraag', 'value': 'question'}, {'title': 'Leerdoel', 'value': 'section'}, ]"
                                :title="item.title"
                                :value="item.value"
                                :active="selected_analysis_type == item.value"
                                @click="selected_analysis_type = item.value; selected_analysis_item_id = 'overview'"
                            )

                    v-divider(vertical)
                    v-col(style="max-width: 200px").h-100
                        v-list().h-100
                            v-list-item(
                                title="Selecteer specifiek"
                            )
                            v-divider
                            v-list-item(
                                title="Overzicht"
                                :value="'overview'"
                                @click="selected_analysis_item_id = 'overview'"
                                :active="selected_analysis_item_id == 'overview'"
                            )
                            v-divider

                            v-list-item(
                                v-for="item in selected_nav_list_items"
                                :title="item.title"
                                :value="item.id"
                                :active="selected_analysis_item_id == item.id"
                                @click="selected_analysis_item_id = item.id"
                            )

                    v-divider(vertical)

                    v-col.h-100(style="max-width: calc(100% - 400px)")
                        v-select(v-model="test.data_type" :items="['points', 'percent']")
                        div.pa-2(style="max-height: calc(100% - 56px); overflow-y: scroll;")
                            div(
                                v-if="selected_analysis_item_id == 'overview'"
                            )
                                h1 Overview
                                v-divider
                                //- div(v-if="selected_analysis_type == 'student'")
                                //- div(v-if="selected_analysis_type == 'question'")
                                //- div(v-if="selected_analysis_type == 'section'")

                                    //- :headers="resultHeaders"
                                v-expansion-panels(multiple)
                                    v-expansion-panel()
                                        v-expansion-panel-title Tabel
                                        v-expansion-panel-text
                                            v-data-table(
                                                :items="resultOverviewItems"
                                                density="compact"
                                            )
                                                template(v-slot:item="{ item }")
                                                    tr  
                                                        td(v-for="val in Object.values(item)") 
                                                            | {{ (test.data_type == "percent" && !(typeof val == 'string')) ? Math.round(val * 100) / 100 : val }}
                                    v-expansion-panel()
                                        v-expansion-panel-title Extra
                                        v-expansion-panel-text
                                            div(v-if="selected_analysis_type == 'student'")
                                                b Als studenten
                                                p download hier een pdf met uitprintbare resultaten (per vraag en per leerdoel) per student
                                                b Als vraag
                                                p zie als docent hier welke vragen het slechts gemaakt zijn
                                                b Als leerdoel
                                                p zie als docent hier welke leerdoel het slechts gemaakt zijn
                            div(
                                v-else
                            )   
                                h1 {{ selected_analysis_item_id }}

            //- div
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
                

            // Page "Bewerk"-code starts here!
            v-window-item(value="edit")

</template>

<script>
// Data 
import data_classes from '@/classes'
import {  excelFileToJSON, sum, uncircularStringify } from '@/helpers'


// Components


export default {
    name: 'App',
    components: {
    
    },
    props: {
   
    },
    emits: [],
    setup() {
       return { data_classes, uncircularStringify }
    },
    data(){
        return {
           selected_tab: 'analyse',

            // loading tab
            excel_file: null,
            test_data: {
                "Sheet1": [
                    {
                        "__EMPTY": "Student_1",
                        "Q1": 6,
                        "Q2": 1,
                        "Q3": 1,
                        "Q4": 5,
                        "Q5": 1,
                        "Q6": 4,
                        "Q7": 6,
                        "Q8": 3,
                        "Q9": 3,
                        "Q10": 4,
                        "Total": 34
                    },
                    {
                        "__EMPTY": "Student_2",
                        "Q1": 6,
                        "Q2": 0,
                        "Q3": 1,
                        "Q4": 11,
                        "Q5": 15,
                        "Q6": 3,
                        "Q7": 3,
                        "Q8": 5,
                        "Q9": 3,
                        "Q10": 9,
                        "Total": 56
                    },
                    {
                        "__EMPTY": "Student_3",
                        "Q1": 8,
                        "Q2": 1,
                        "Q3": 0,
                        "Q4": 8,
                        "Q5": 7,
                        "Q6": 2,
                        "Q7": 2,
                        "Q8": 7,
                        "Q9": 1,
                        "Q10": 10,
                        "Total": 46
                    },
                    {
                        "__EMPTY": "Student_4",
                        "Q1": 11,
                        "Q2": 4,
                        "Q3": 4,
                        "Q4": 12,
                        "Q5": 5,
                        "Q6": 0,
                        "Q7": 6,
                        "Q8": 5,
                        "Q9": 1,
                        "Q10": 4,
                        "Total": 52
                    },
                    {
                        "__EMPTY": "Student_5",
                        "Q1": 5,
                        "Q2": 2,
                        "Q3": 5,
                        "Q4": 12,
                        "Q5": 11,
                        "Q6": 4,
                        "Q7": 2,
                        "Q8": 5,
                        "Q9": 1,
                        "Q10": 10,
                        "Total": 57
                    },
                    {
                        "__EMPTY": "Student_6",
                        "Q1": 7,
                        "Q2": 1,
                        "Q3": 7,
                        "Q4": 6,
                        "Q5": 11,
                        "Q6": 3,
                        "Q7": 0,
                        "Q8": 6,
                        "Q9": 6,
                        "Q10": 9,
                        "Total": 56
                    },
                    {
                        "__EMPTY": "Student_7",
                        "Q1": 10,
                        "Q2": 2,
                        "Q3": 14,
                        "Q4": 6,
                        "Q5": 7,
                        "Q6": 2,
                        "Q7": 0,
                        "Q8": 8,
                        "Q9": 6,
                        "Q10": 7,
                        "Total": 62
                    },
                    {
                        "__EMPTY": "Student_8",
                        "Q1": 6,
                        "Q2": 0,
                        "Q3": 0,
                        "Q4": 12,
                        "Q5": 8,
                        "Q6": 1,
                        "Q7": 5,
                        "Q8": 8,
                        "Q9": 4,
                        "Q10": 7,
                        "Total": 51
                    },
                    {
                        "__EMPTY": "Student_9",
                        "Q1": 10,
                        "Q2": 2,
                        "Q3": 2,
                        "Q4": 12,
                        "Q5": 8,
                        "Q6": 1,
                        "Q7": 7,
                        "Q8": 5,
                        "Q9": 0,
                        "Q10": 7,
                        "Total": 54
                    },
                    {
                        "__EMPTY": "Student_10",
                        "Q1": 6,
                        "Q2": 1,
                        "Q3": 4,
                        "Q4": 8,
                        "Q5": 9,
                        "Q6": 0,
                        "Q7": 0,
                        "Q8": 8,
                        "Q9": 4,
                        "Q10": 2,
                        "Total": 42
                    },
                    {
                        "__EMPTY": "Student_11",
                        "Q1": 5,
                        "Q2": 0,
                        "Q3": 3,
                        "Q4": 7,
                        "Q5": 7,
                        "Q6": 2,
                        "Q7": 5,
                        "Q8": 5,
                        "Q9": 3,
                        "Q10": 5,
                        "Total": 42
                    },
                    {
                        "__EMPTY": "Student_12",
                        "Q1": 8,
                        "Q2": 2,
                        "Q3": 6,
                        "Q4": 5,
                        "Q5": 6,
                        "Q6": 4,
                        "Q7": 0,
                        "Q8": 8,
                        "Q9": 7,
                        "Q10": 10,
                        "Total": 56
                    },
                    {
                        "__EMPTY": "Student_13",
                        "Q1": 5,
                        "Q2": 2,
                        "Q3": 1,
                        "Q4": 13,
                        "Q5": 14,
                        "Q6": 4,
                        "Q7": 3,
                        "Q8": 5,
                        "Q9": 5,
                        "Q10": 3,
                        "Total": 55
                    },
                    {
                        "__EMPTY": "Student_14",
                        "Q1": 8,
                        "Q2": 0,
                        "Q3": 5,
                        "Q4": 8,
                        "Q5": 7,
                        "Q6": 0,
                        "Q7": 2,
                        "Q8": 7,
                        "Q9": 6,
                        "Q10": 8,
                        "Total": 51
                    },
                    {
                        "__EMPTY": "Student_15",
                        "Q1": 10,
                        "Q2": 6,
                        "Q3": 2,
                        "Q4": 8,
                        "Q5": 4,
                        "Q6": 5,
                        "Q7": 7,
                        "Q8": 4,
                        "Q9": 5,
                        "Q10": 10,
                        "Total": 61
                    },
                    {
                        "__EMPTY": "Student_16",
                        "Q1": 8,
                        "Q2": 3,
                        "Q3": 3,
                        "Q4": 4,
                        "Q5": 12,
                        "Q6": 5,
                        "Q7": 5,
                        "Q8": 4,
                        "Q9": 2,
                        "Q10": 3,
                        "Total": 49
                    },
                    {
                        "__EMPTY": "Student_17",
                        "Q1": 9,
                        "Q2": 4,
                        "Q3": 4,
                        "Q4": 13,
                        "Q5": 6,
                        "Q6": 2,
                        "Q7": 0,
                        "Q8": 4,
                        "Q9": 6,
                        "Q10": 6,
                        "Total": 54
                    },
                    {
                        "__EMPTY": "Student_18",
                        "Q1": 10,
                        "Q2": 3,
                        "Q3": 12,
                        "Q4": 9,
                        "Q5": 4,
                        "Q6": 2,
                        "Q7": 0,
                        "Q8": 8,
                        "Q9": 4,
                        "Q10": 6,
                        "Total": 58
                    },
                    {
                        "__EMPTY": "Student_19",
                        "Q1": 7,
                        "Q2": 3,
                        "Q3": 1,
                        "Q4": 12,
                        "Q5": 12,
                        "Q6": 1,
                        "Q7": 0,
                        "Q8": 5,
                        "Q9": 5,
                        "Q10": 7,
                        "Total": 53
                    },
                    {
                        "__EMPTY": "Student_20",
                        "Q1": 9,
                        "Q2": 5,
                        "Q3": 4,
                        "Q4": 6,
                        "Q5": 12,
                        "Q6": 2,
                        "Q7": 6,
                        "Q8": 8,
                        "Q9": 2,
                        "Q10": 10,
                        "Total": 64
                    },
                    {
                        "__EMPTY": "Max Points",
                        "Q1": 11,
                        "Q2": 8,
                        "Q3": 17,
                        "Q4": 19,
                        "Q5": 15,
                        "Q6": 12,
                        "Q7": 17,
                        "Q8": 9,
                        "Q9": 11,
                        "Q10": 14,
                        "Total": 133
                    }
                ]
            },
            is_loaded: false,
            test: new data_classes.Test({}),

            // loading tab data
            selected_question_number: null,
            sections: [],

            // analysis tab data
            selected_analysis_type: 'student',
            selected_analysis_item_id: null,

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
        selected_question_index(){return this.test.questions.map(e => e.question_number).indexOf(this.selected_question_number)},
        selected_question: {
            get(){
            const index = this.selected_question_index
            if (index != -1){
                return this.test.questions[index]
            }
            return null
            },
            set(val){
                const index = this.selected_question_index
                if (index != -1){
                    // set without changing reference
                    return this.test.questions[index].set(val)
                }
            }
        },
        selected_nav_list_items(){
            switch (this.selected_analysis_type) {
                case "student":
                    return this.test.students.map(e => {return {title: e.name, id: e.id, item: e}})
                    break;
                case "question":
                    return this.test.questions.map(e => {return {title: 'Vraag '+e.question_number, id: e.id, item: e}})
                    break;
                case "section":
                    return this.test.sections.map(e => {return {title: e.name, id: e.id, item: e}})
                    break;
                                    
                default:
                    return []
                    break;
            }
        },
        selected_item:{
            get(){
                return this.selected_nav_list_items.find( e=> e.id == this.selected_analysis_item_id)
            },
            set(val){
                const index = this.test[selected_analysis_type+"s"].findIndex(e=>e.id==this.selected_analysis_item_id)
                if (index != -1){
                    this.test[selected_analysis_type+"s"][index] = val
                }
            }
        },
        selected_item_results(){
            return this.selectedTypeGroupsById[this.selected_analysis_item_id]
        },
        
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

        selectedTypeGroupsById(){
            const grouped_data = {}
            switch (this.selected_analysis_type) {
                case "student":

                    this.test.students.forEach(e => {
                        grouped_data[e.id] = this.test.results.getStudentResults(e.id)
                    })
                    break;
                case "question":
                    this.test.questions.forEach(e => {
                        grouped_data[e.id] = this.test.results.getQuestionResults(e.id)
                    })
                    break;
                case "section":
                    this.test.sections.forEach(e => {
                        grouped_data[e.id] = this.test.results.getSectionResults(e.id)
                    })                
                    break;
                                    
                default:
                    break;
            }

            return grouped_data
        },
        resultOverviewItems(){
            const grouped_data = this.selectedTypeGroupsById
            return Object.keys(grouped_data).map(item_id => {
                const data = grouped_data[item_id]
                return {
                    id: item_id,
                    average: data.average,
                    standard_dev: data.standard_deviation,
                    grade: data.grade,
                    total_points: data.points
                }
            })
        },
        
   },
   methods: {
        async loadClassData(){
            const data = this.excel_file ? await excelFileToJSON(this.excel_file) : this.test_data
            console.log(this.excel_file)
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
                    id: student_id,
                    name: student_id
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
            this.test.results.test = this.test
            this.is_loaded = true
            console.log(this.test)
        },
        clickSectionCheckbox(section){
            const index = this.selected_question.sections.indexOf(section)
            // found
            if (index != -1) {
                this.selected_question.sections.splice(index, 1)
            } else {
                // not found
                this.selected_question.sections.push(section)

            }
        },
        deleteSection(section){
            if (window.confirm("Weet je zeker dat je " + section.name + " overal wilt verwijderen")) {
                const index = this.sections.indexOf(section)

                this.sections.splice(index,1)
                
                this.test.questions.forEach( (question, question_index) => {
                    question.sections.forEach((question_section, section_index) => {
                        if (section.id == question_section.id){
                            this.test.questions[question_index].sections.splice(section_index, 1)
                        }
                    })
                })
            }
            
            
        }
    },
    watch: {
        excel_file(){
            this.loadClassData
        }
    },
    // created() {
   
    // },
    async mounted() {
        await this.loadClassData()
        this.selected_tab = 'analyse'
    },
   
   
}
</script>
   
<style scoped>
.mh-100 {
    max-height: 100%
}
</style>
<style>
body {
    overflow: hidden; /* Hide scrollbars */
}
</style>