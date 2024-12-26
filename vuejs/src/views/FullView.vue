<template lang="pug">
div
    v-navigation-drawer(
        permanent
        nav
        width="160"
    )
        v-list(
            :selected="[selected_section_id]"
            mandatory
        )
            v-list-item Onderdelen
            v-divider
            v-list-item(
                v-for="section in main_sections"
                :value="section.id"
                @click="selected_section_id = section.id"
            ) {{ section.name }}
    v-navigation-drawer(
        permanent
        nav
        width="160"

    )
        v-list(
            :selected="[selected_section.selected_subsection_id]"
            mandatory
        )
            v-list-item(
                v-for="(section, index) in selected_section.subsections"
                :value="section.id"
                @click="selected_section.selected_subsection_id = section.id"
                nav
            ) {{ section.name }}
    


    div(v-if="selected_section_id == 'test'")
        div(v-if="selected_subsection.id == 'test' || selected_subsection.id == 'rubric'")
            v-row(style="height: 100vh")
                v-col
                    h2 PDF {{ selected_subsection.name }}
                    div.d-flex.flex-row
                        v-file-input(
                            v-model="test.files[selected_subsection.id].raw"
                            accept="application/pdf"
                            @update:modelValue="async ($event) => {test.files[selected_subsection.id].url = await toDataURL($event)}"
                        )
                        v-btn(
                            text="Laad toets"
                            @click="test.loadDataFromPdf(selected_subsection.id)"
                        )
                    object.w-100(style="height: calc(100% - 40px)" :data="test.files[selected_subsection.id].url" type="application/pdf" class="internal")
                        embed(

                            v-if="test.files[selected_subsection.id].url"
                            :src="test.files[selected_subsection.id].url"
                            type="application/pdf"
                        )
                v-col.h-100(style="overflow-y: scroll; position: relative")
                    v-card.d-flex.flex-row(style="position: sticky; top: 0; z-index: 3")
                        h2 Computerdata

                    div(v-for="(item,index) in  test.files[selected_subsection.id].data")
                        v-expansion-panels
                            v-expansion-panel
                                v-expansion-panel-title {{ item.type }}
                                v-expansion-panel-text
                                    div(v-if="item.type == 'text'")
                                        v-textarea(v-model="test.files[selected_subsection.id].data[index].data")
                                    div(v-if="item.type == 'image'")
                                        img(style="height: 300px" :src="item.data")
        div(v-if="selected_subsection.id == 'structure'")
            v-row(style="height: 100vh")
                v-col.h-100(style="overflow-y: scroll; position: relative")
                    v-card.d-flex.flex-row(style="position: sticky; top: 0; z-index: 3")
                        h2 Laad structuur
                        v-btn(
                            text="Laad structuur met gpt request"
                            @click="test.loadTestStructure()"
                        )
                    h2 Vragen
                    v-expansion-panels
                        v-expansion-panel(
                            v-for="(question,index) in test.questions"
                            :title="question.question_number + '. ' + question.question_text"
                        )
                            v-expansion-panel-text
                                v-textarea(
                                    v-model="test.questions[index].question_text"
                                    label="Vraag text"
                                    auto-grow
                                )
                                b Rubric
                                v-table(
                                    density="compact"
                                )
                                    thead
                                        tr
                                            th(style="width: 80px") Pt.
                                            th Kort
                                            th Lang
                                            th Leerdoel
                                            th(width="55px")
                                    tbody
                                        tr(
                                            v-for="(rubric_point, point_index) in question.points"
                                        )
                                            td.pa-0
                                                v-number-input(
                                                    v-model="test.questions[index].points[point_index].point_weight"
                                                    type="number"
                                                    :min="0"
                                                    controlVariant="stacked"
                                                    density="compact"
                                                    
                                                )
                                            td.pa-0
                                                v-text-field(
                                                    v-model="test.questions[index].points[point_index].point_name"
                                                    density="compact"
                                                )
                                            td.pa-0
                                                v-textarea(
                                                    v-model="test.questions[index].points[point_index].point_text"
                                                    auto-grow
                                                    :rows="1"
                                                    density="compact"
                                                )
                                            td.pa-0
                                                v-select(
                                                    :items="test.targets.map((e,index) => {return {name: e.target_name, id: e.id}})"
                                                    :modelValue="test.questions[index].points[point_index].target_id"
                                                    item-title="name"
                                                    item-value="id"
                                                    density="compact"
                                                )
                                            td.pa-0
                                                v-icon(icon="mdi-delete" color="red" @click="test.questions[index].points.splice(point_index,1)" )
                                v-btn(
                                    prepend-icon="mdi-plus"
                                    text="Voeg toe"
                                    @click="test.questions[index].addRubricPoint({})"
                                )
                v-col.h-100
                    h2 Leerdoelen
                    v-table(
                        density="compact"
                    )
                        thead
                            tr
                                th Naam
                                th Uitleg
                                th(width="55px")
                        tbody
                            tr(
                                v-for="(target, index) in test.targets"
                            )
                                td.pa-0
                                    v-text-field(
                                        v-model="test.targets[index].target_name"
                                        density="compact"
                                    )
                                td.pa-0
                                    v-textarea(
                                        v-model="test.targets[index].explanation"
                                        auto-grow
                                        :rows="1"
                                        density="compact"
                                    )
                                td.pa-0
                                    v-icon(icon="mdi-delete" color="red" @click="test.targets.splice(index,1)" )
                    v-btn(
                        prepend-icon="mdi-plus"
                        text="Voeg toe"
                        @click="test.addTarget({})"
                    )
    div.h-100(v-if="selected_section_id == 'scan'")
        div(v-if="selected_subsection.id == 'load_pages'")
            v-row(style="height: 100vh")
                v-col
                    h2 PDF {{ selected_subsection.name }}
                    b 1 pdf tegelijk (inladen met knop), foto's laden automatisch 
                    div.d-flex.flex-row
                        v-file-input(
                            v-model="test.files.students.raw"
                            accept="application/pdf  image/*"
                            @update:modelValue="loadStudentPages"
                            multiple
                        )
                        v-btn(
                            text="Laad toets"
                            @click="test.loadDataFromPdf(selected_subsection.id)"
                        )
                    object.w-100(style="height: calc(100% - 40px)" :data="test.files.students.url" type="application/pdf" class="internal")
                        embed(

                            v-if="test.files.students.url"
                            :src="test.files.students.url"
                            type="application/pdf"
                        )
                v-col.h-100(style="overflow-y: scroll; position: relative")
                    v-card.d-flex.flex-row(style="position: sticky; top: 0; z-index: 3")
                        h2 Computerdata
                        v-btn(
                            text="Sla op"
                            @click="test.createPages()"
                        )
                    div.d-flex.flex-wrap
                        div.pa-1(
                            style="position: relative; width: 50%"
                            v-for="(image, index) in test.files.students.data"
                        )
                        
                            v-icon(
                                icon="mdi-delete" 
                                color="red" 
                                @click="test.files.students.data.splice(index,1)" 
                                style="position: absolute; top: 0; right: 0;"
                            )
                            img.w-100(
                                :src="image"
                            )
        div(v-if="selected_subsection.id == 'scan_pages'")
            h2 Scan pages
            v-btn(
                text="Laad alle data"
                @click="test.scanPages()"
            )
            ImagesPreview(

                height="calc(100vh - 80px)"
                :items="test.pages.map((page, index) => {return {page, index, id:page.id, image: page.base64Image, is_loading: page.is_loading_all, title:(index+1).toString()}})"
                @delete="test.pages.splice(test.pages.findIndex(e => e.id == $event), 1)"
                :hasDeleteButton="true"
                v-model="selected_page_id"
            )
                template(v-slot:selected="{ item }")
                    v-row.w-100
                        v-col
                            img(
                                v-if="item.image"
                                style="max-height: 100%; max-width: 100%"
                                v-fullscreen-img="{scaleOnHover: true}"
                                :src="item.image" 
                            )
                        v-col.w-50
                            v-text-field(
                                label="Leerlingnummer"
                                v-model="test.pages[item.index].student_id"
                            )
</template>

<script>
// Data 
import { imageToPngBase64 } from '@/helpers'
import { Test } from '@/scan_api_classes'
import test_example from '@/assets/test_example.pdf'
import rubric_example from '@/assets/rubric_example.pdf'
import student_example from '@/assets/24-11-13_PWStoetsG3B.pdf'

// Components
import ImagesPreview from '@/components/image/ImagesPreview.vue'

export default {
    name: 'FullView',
    components: {
        ImagesPreview
    },
    props: {

    },
    emits: [],
    setup() {

    },
    data() {
        return {
            main_sections: [
                {
                    name: 'Toets inladen',
                    id: 'test',
                    selected_subsection_id: 'test',
                    subsections: [
                        {
                            name: "toets",
                            id: "test"
                        },
                        {
                            name: "rubric",
                            id: "rubric"
                        },
                        {
                            name: "ordenen",
                            id: "structure"
                        },
                    ]
                },
                {
                    name: 'Inscannen',
                    id: 'scan',
                    selected_subsection_id: 'scan_pages',
                    subsections: [
                        {
                            name: "Inladen",
                            id: "load_pages"
                        },
                        {
                            name: "Scannen",
                            id: "scan_pages"
                        },
                    ]
                },
                {
                    name: 'nakijken',
                    id: 'grade',
                    subsections: [
                        {
                            name: "",
                            id: ""
                        }
                    ]
                },
                {
                    name: 'analyseer',
                    id: 'analyze',
                    subsections: [
                        {
                            name: "",
                            id: ""
                        }
                    ]
                },
            ],
            selected_section_id: 'scan',
            test: new Test({}),
            selected_page_id: ''
        }
    },
    computed: {
        selected_section: {
            get() {
                return this.main_sections.find(e => e.id == this.selected_section_id)
            },
            set(val) {
                const index = this.main_sections.findIndex(e => e.id == val.id)

                if (index != -1) {
                    this.main_sections[index] = val
                }
            }
        },
        selected_subsection: {
            get() {
                return this.selected_section.subsections.find(e => e.id == this.selected_section.selected_subsection_id)
            },
            set(val) {
                const index = this.selected_section.subsections.findIndex(e => e.id == this.selected_section.selected_subsection_id)

                if (index != -1) {
                    this.selected_section.subsections[index] = val
                }
            }
        }
    },
    methods: {
        log(s) { console.log(s) },
        async toDataURL(file) {
            console.log(file)
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = () => {
                    console.log("Loaded pdf file")
                    resolve(reader.result);
                };

                reader.onerror = () => {
                    reject(reader.error);
                };

                reader.readAsDataURL(file);
            });
        },
        base64ToBlob(base64String, contentType = '') {
            // Remove data URL prefix if it exists
            var base64Data = base64String.replace(/^data:([^;]+);base64,/, '');

            // Convert base64 to raw binary data
            var binaryData = atob(base64Data);

            // Create array buffer from binary data
            var arrayBuffer = new ArrayBuffer(binaryData.length);
            var uint8Array = new Uint8Array(arrayBuffer);

            // Fill array buffer with binary data
            for (let i = 0; i < binaryData.length; i++) {
                uint8Array[i] = binaryData.charCodeAt(i);
            }

            // Create blob from array buffer
            var blob = new Blob([arrayBuffer], { type: contentType });

            // Create and return blob URL
            return URL.createObjectURL(blob);
        },
        async loadBlob(filepath) {
            return new Promise((resolve, reject) => {
                // 1. Construct the full URL to the file within the site's directory.
                //    Assuming 'filepath' is relative to the current page or site's root.
                const fileUrl = new URL(filepath, window.location.href).href;

                // 2. Create a new XMLHttpRequest object to fetch the file.
                const xhr = new XMLHttpRequest();

                // 3. Configure the request:
                xhr.open('GET', fileUrl);
                xhr.responseType = 'blob'; // Tell the browser to expect a Blob as the response.

                // 4. Set up event listeners for successful load and errors.
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        resolve(xhr.response); // Resolve the promise with the Blob object.
                    } else {
                        reject(new Error(`Failed to load file: ${xhr.status} - ${xhr.statusText}`));
                    }
                };

                xhr.onerror = function () {
                    reject(new Error("Network error occurred while fetching the file."));
                };

                // 5. Send the request.
                xhr.send();
            });
        },
        async loadStudentPages(event) {
            event.forEach(async file => {
                if (file.type.startsWith('image/')){
                    const base64png = await imageToPngBase64(file)
                    if (base64png){
                        this.test.files.students.data.push(base64png)
                    }
                }
                if (file.type.startsWith('application/pdf')) {
                    this.test.files.students.raw = file
                    this.test.files.students.url = URL.createObjectURL(file)

                }
            })
        }


    },
    watch: {

    },
    // created() {

    // },
    async mounted() {
        const test_blob = await this.loadBlob(test_example)
        const rubric_blob = await this.loadBlob(rubric_example)
        var student_blob = this.loadBlob(student_example)


        this.test.files.test.raw = test_blob
        this.test.files.test.url = URL.createObjectURL(test_blob)//await this.toDataURL(test_blob)
        await this.test.loadDataFromPdf('test')
        this.test.files.rubric.raw = rubric_blob
        this.test.files.rubric.url = URL.createObjectURL(rubric_blob)//await this.toDataURL(rubric_blob)
        await this.test.loadDataFromPdf('rubric')

        await this.test.loadTestStructure()

        student_blob = await student_blob

        this.test.files.students.raw = student_blob
        this.test.files.students.url = URL.createObjectURL(student_blob)//await this.toDataURL(student_blob)

        await this.test.loadDataFromPdf('students')

        this.test.createPages()

        console.log(this.test)




    },


}
</script>

<style scoped></style>
