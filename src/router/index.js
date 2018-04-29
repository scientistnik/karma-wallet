import Vue from 'vue'
import VueRouter from 'vue-router'
import Main from '../components/Main.vue'
import Transfer from '../components/Transfer.vue'
import Proposal from '../components/Proposal.vue'
import Register from '../components/Register.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Main
  },
  {
    path: '/transfer',
    component: Transfer,
    props: true
  },
  {
    path: '/proposal',
    component: Proposal
  },
  {
    path: '/register',
    component: Register,
    props: true
  }
]

export default new VueRouter({ routes })