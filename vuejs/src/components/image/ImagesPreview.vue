<template lang="pug">
v-card.pa-2.w-100.d-flex(
    color="#424242"
    :style="{'max-height': height, 'max-width': 'min(100%, 500px)'}"
)
    p {{  $vuetify.mdAndUp}}
    div(:style="{'max-height': '100%', 'max-width': '130px', 'overflow-y': 'scroll'}" )
        div.w-100.d-flex.flex-column
            div.list-image.my-2(
                v-for="(image, index) in cover_images"
                @click="selected_image_index=index"
                :class="{'selected-list-image': index==selected_image_index}"
                
            )
                v-img(
                    :src="image"
                    style="max-height: calc(120px - 24px)"

                )
                p.text-center {{ index+1 }}
                v-divider(:vertical="!this.$vuetify.display.mdAndUp" color="white")
                div(v-if="hasDeleteButton" style="position: absolute; top: 0px; left: 0px")
                    v-icon(color="red" icon="mdi-delete" @click="$emit('delete', index)") 
    v-divider.px-1(vertical color="white")
    div(style="width: calc(100% - 126px); max-height: 100%")
        div(v-if="!isBeforeAfter")
            img(
                style="height: 100%"
                v-fullscreen-img="{scaleOnHover: true}"
                :src="images[selected_image_index]" 
            )
        div.d-flex.flex-row(v-else-if="images[selected_image_index] && images[selected_image_index].length == 2")
            div.w-50
                p Before
                img(
                    style="height: auto; max-width: 100%"
                    v-fullscreen-img="{scaleOnHover: true}"
                    :src="images[selected_image_index][0]" 
                )
            v-divider.mx-1(vertical)
            div.w-50 
                p After
                img(
                    style="height: auto; max-width: 100%"
                    v-fullscreen-img="{scaleOnHover: true}"
                    :src="images[selected_image_index][1]" 
                )
</template>

<script>
// Data 


// Components


export default {
    name: 'ImagesPreview',
    components: {
    
    },
    props: {
        images: {
            default: [],
        },
        height: {
            default: '100%',
        },
        hasDeleteButton: {
            default: false
        },
        isBeforeAfter: {
            default: false
        }
    },
    emits: ['delete'],
    setup() {
        
    },
    data(){
        return {
            selected_image_index: 0
        }
    },
    computed: {
        cover_images(){
            if (this.isBeforeAfter){
                return this.images.map(e => e[0])
            }
            return this.images
        }
    },
    methods: {
    
    },
    watch: {
    
    },
    // created() {
    
    // },
    mounted() {
    
    },
    
    
}
</script>
    
<style scoped>
.list-image{
    aspect-ratio: 1/1;
    width: 100%;
    height: 120px;
    border: solid rgba(0, 0, 0, 0) 2px;
    position: relative

}
.selected-list-image{
    border: solid black 2px
}
</style>
