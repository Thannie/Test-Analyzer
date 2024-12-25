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

</template>

<script>
// Data 
import { Test } from '@/scan_api_classes'
import test_example from '@/assets/test_example.pdf'
import rubric_example from '@/assets/rubric_example.pdf'

// Components

export default {
    name: 'FullView',
    components: {

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
                    subsections: [
                        {
                            name: "",
                            id: ""
                        }
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
            selected_section_id: 'test',
            test: new Test({})
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
                xhr.onload = function() {
                if (xhr.status === 200) {
                    resolve(xhr.response); // Resolve the promise with the Blob object.
                } else {
                    reject(new Error(`Failed to load file: ${xhr.status} - ${xhr.statusText}`));
                }
                };

                xhr.onerror = function() {
                reject(new Error("Network error occurred while fetching the file."));
                };

                // 5. Send the request.
                xhr.send();
            });
        }


    },
    watch: {

    },
    // created() {

    // },
    async mounted() {
        const test_blob = await this.loadBlob(test_example)
        const rubric_blob = await this.loadBlob(rubric_example)


        this.test.files.test.raw = test_blob
        this.test.files.test.url = await this.toDataURL(test_blob)
        await this.test.loadDataFromPdf('test')
        this.test.files.rubric.raw = rubric_blob
        this.test.files.rubric.url = await this.toDataURL(rubric_blob)
        await this.test.loadDataFromPdf('rubric')



    },


}
</script>

<style scoped></style>
