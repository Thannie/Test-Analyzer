/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
  },
  defaults: {
    global: {
        // elevation: 0,
        hideDetails: 'auto'

    },
    VTextField: {
        hideDetails: 'auto'
    },
    // make sure swiping is disabled: this can cause users to access windows wich are not ment for them
    VWindow: {
        touch: {left: ()=>{}, right:()=>{}}
    },
    VInput: {
        hideDetails: 'auto'
    },
    VSwitch: {
        color: 'primary'
    },
    VBtn: {
        color: 'primary'
    
    }

  }
})
