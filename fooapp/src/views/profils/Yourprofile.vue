<template>
  <div>
    <!-- nav bar area start -->
      <vs-navbar
        :type="type"
        :color="colorx"
        v-model="activeItem"
        class="nabarx spacing-added-to-nav">
        <div slot="title">
          <vs-navbar-title>
            <vs-navbar-title class="logo-and-brand">
                <img class="logo-all-places" src="https://res.cloudinary.com/datafeelya69/image/upload/v1611938624/logoFoodify_ywgtic.png" alt="test">
                <h2 class="title-big-landing">FOODIFY</h2>
            </vs-navbar-title>
          </vs-navbar-title>
        </div>

        <vs-navbar-item class="spacing-navbar-element">
          <span @click="myprofil">{{ connectedUserName }}</span>
        </vs-navbar-item>
        <vs-navbar-item class="spacing-navbar-element">
          <span  @click="goMAinFeed">Main Feed</span>
        </vs-navbar-item>
        <vs-navbar-item v-if="connectedUserStatus ==='admin'"  class="spacing-navbar-element">
          <span @click="adminDashboard">Admin dashboard</span>
        </vs-navbar-item>
        <vs-navbar-item class="spacing-navbar-element">
          <span @click="logout">Logout</span>
        </vs-navbar-item>
      </vs-navbar>
      <!-- nav bar area end -->
      <!-- start the avatar picture and interactions -->
      <div v-if="pointedAtUserData" class="profil-main-info">
          <vs-avatar  class="avaatar" size="180px" :src= pointedAtUserData.image />
          <div class="following-area-comps">
            <h2 class="profil-username"> {{ pointedAtUserData.username }} </h2>
            <vs-button v-if="!pointedFollowedByYou" @click="follow(pointedAtUserData._id, connectedUserId)" class="following-buttn" color="danger" type="gradient" icon="person_add"> Follow</vs-button>
            <vs-button v-if="pointedFollowedByYou" @click="unfollow(pointedAtUserData._id, connectedUserId)" class="following-buttn" color="warning" type="border" icon="person_add"> Unfollow</vs-button>
          </div>
          <!-- End the avatar picture and interactions -->
          <!-- start conditional rendering data -->
              <div class="profil-interact-info">
                <vs-row vs-justify="center">
                  <vs-col type="flex" vs-justify="center" vs-align="center" vs-w="12" vs-sm="12">
                  <vs-card>
                  <div slot="header">
                  <h4>
                    Followers : {{pointedAtUserfollowers}}
                  </h4>
                  </div>
                  </vs-card>
                  </vs-col>
                  </vs-row>
                  <vs-row vs-justify="center">
                  <vs-col type="flex" vs-justify="center" vs-align="center" vs-w="12" vs-sm="12">
                  <vs-card>
                  <div slot="header">
                  <h4>
                    Likes : {{pointedAtUserLikes}}
                  </h4>
                  </div>
                  </vs-card>
                  </vs-col>
                </vs-row>
            </div>
            <!-- End conditional rendering data -->
            <!-- start of posts feed -->
              <vs-row v-if="pointedFollowedByYou" vs-justify="center">
              <vs-col type="flex" vs-justify="center" vs-align="center" vs-w="5" vs-sm="12">
              <vs-card>
              <div slot="header">
              <h4>
                My posts
              </h4>
              </div>
              </vs-card>
              </vs-col>
              </vs-row>
              <Profilfeed v-if="pointedFollowedByYou" :userId="pointedAtUserData._id"/>
            <!-- End of posts feed -->
      </div>
      <Chatting />
      <Clicktopost />
  </div>
</template>

<script>
import axios from 'axios';
import Profilfeed from './Profilfeed.vue';
import Clicktopost from '../posts/Clicktopost';
import Chatting from '../posts/Chatting'
const Cookies = require("js-cookie");
  export default {
    name: "yourprofiles",
    components:{
       Profilfeed,
       Clicktopost,
       Chatting
    },
    data: () => ({
      //functionals
      popupActivo: false,
      type: "type",
      activeItem: "activeItem",
      //connected user data
      connectedUserName: Cookies.get("name"),
      connectedUserId: Cookies.get("_id"),
      connectedUserStatus: Cookies.get("status"),
      connectedUserData: null,
      connectedFollowersArray: null,
      //pointed at user data
      pointedAtUserId: "",
      pointedAtUserData: null,
      pointedAtUserfollowers: 0,
      pointedAtUserLikes: 0,
      //following system related
      pointedFollowedByYou : false,
      //style related data
      colorx: "#262523",

    }),
    async mounted() {
      this.pointedAtUserId =this.$route.params.idtheprofile
      //the likes for the pointed at user actual profile
      const mylikes= await axios.get(`/api/likes/mylike/${this.pointedAtUserId}`)
      if(mylikes){
          this.pointedAtUserLikes = mylikes.data.length
      }
      //we need the data of the pointed at user first
      const pointedData = await axios.get(`/api/loginsignup/${this.pointedAtUserId}`);
      //and the rest of the full data for the connected user for the
      const connectedData = await axios.get(`/api/loginsignup/${this.connectedUserId}`);
      if(pointedData && connectedData){
        //atributing data to the pointed at user
        this.pointedAtUserData = pointedData.data;
        this.pointedAtUserfollowers = pointedData.data.followingYou
        //atributing data to the connected user
        this.connectedUserData = connectedData.data;
        this.connectedFollowersArray = connectedData.data.followers
        //checking if the pointed user exists in the followers list of the connected user
        if(this.connectedFollowersArray.length){
          if(this.connectedFollowersArray.indexOf(this.pointedAtUserId)>=0){
            this.pointedFollowedByYou = true;
          }
        }
          // eslint-disable-next-line
          console.log("pointedData : ", this.pointedAtUserData);
          // eslint-disable-next-line
          console.log("connectedData : ", this.connectedUserData);
      }
    },
    methods: {
      logout() {
        Cookies.remove("name");
        Cookies.remove("_id");
        Cookies.remove("status");
        Cookies.remove("img");
        document.location.replace('/');
      },
      adminDashboard(){
        this.$router.push("/admindashboard");
      },
      goToPost(id){
        this.$router.push(`/post/${id}`)
      },
      goMAinFeed(){
        window.location.replace('/mainfeed');
      },
      myprofil(){
      this.$router.push('/myprofil')
      },
      //following system
      async follow(pointedId, connectId){
        //first we update the connected user array of followers
          this.connectedFollowersArray.push(pointedId)
          const connectedAddFollower = await axios.put(`/api/loginsignup/edit/${connectId}`, {
            followers: this.connectedFollowersArray
          });
        //now that we updated the connected user followers, we will update the pointed at user following numbers
        this.pointedAtUserfollowers++
          const pointedAddFollowingyou = await axios.put(`/api/loginsignup/edit/${pointedId}`, {
            followingYou: this.pointedAtUserfollowers
          });
          if(connectedAddFollower && pointedAddFollowingyou){
            //set the following button to unfollow
            this.pointedFollowedByYou = true;
          }
      },
      //unfollowing system
      async unfollow(pointedId, connectId){
        //first we need to handle the connected user side
        //------------------------------------
        let indexOfPointed =0;
        if(this.connectedFollowersArray.indexOf(this.pointedAtUserId)>=0 && this.pointedAtUserfollowers > 0){
          indexOfPointed = this.connectedFollowersArray.indexOf(this.pointedAtUserId)
        } else {
          alert('we didn\'t found the specified Following')
        }
        //-------------------------------------
        //unfollow the pointed user by the connected user
        this.connectedFollowersArray.splice(indexOfPointed,1)
        const connectedUnfollow = await axios.put(`/api/loginsignup/edit/${connectId}`, {
            followers: this.connectedFollowersArray
        });
        //decrement the number of Followerd for the pointed user
        this.pointedAtUserfollowers--
        const pointedUnffolowingyou = await axios.put(`/api/loginsignup/edit/${pointedId}`, {
            followingYou: this.pointedAtUserfollowers
        });
        if(connectedUnfollow && pointedUnffolowingyou){
          this.pointedFollowedByYou = false;
        }
      }
    }
  }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;1,300&display=swap');
.nabarx{
  background-color: rgba(38,35,37,0.6) ;
}
.spacing-added-to-nav {
  padding: 0.4rem 2.4rem;
}
.spacing-navbar-element {
  margin: 0 0.6rem;
}
.spacing-navbar-element span {
  font-size: 1.02rem;
  color: #fff;
}
.spacing-navbar-element span:hover{
  color:#F27405;
}
.button-nav-spacing {
  width: 7.6rem;
}
.logo-all-places{
  width: 5rem;
  border-radius: 100px
}
/* .landingpage-back-g{
} */
span {
  cursor: pointer;
}
.main {
  height: 90.6vh;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('https://res.cloudinary.com/datafeelya69/image/upload/v1611867542/lily-banse--YHSwy6uqvk-unsplash_fkql1x.jpg');
}
.main h1 {
  font-family: 'Roboto', sans-serif;
  color: white;
  font-size: 4rem;
  font-weight: 400;
  text-shadow: 3px 6px 6px #262523;
}
.logo-and-brand {
  display: flex;
  justify-content: center;
  align-items: center;
}
.title-big-landing{
  font-family: 'Roboto', sans-serif;
  color: #fff;
  margin-left: 1.2rem;
  font-size: 2rem;
  font-weight: 900;
  font-style: italic;
}
.avaatar {
 margin: 4rem auto;
}
.following-area-comps{
  display: flex;
}
.following-buttn{
  width: 7rem;
  margin-left: 1.2rem;
}
.profil-interact-info{
    width: 58rem;
    margin: 4rem auto;
    display: flex;

}
.profil-main-info{
 display: flex;
 flex-direction: column;
 justify-content: center;
 align-items: center;   
}
.profil-username{
    text-align: center;
}
</style>