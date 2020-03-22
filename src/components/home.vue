<template>
<div class="form-body">
    <canvas id="pagebg" resize></canvas>
    <div class="row">
        <div class="form-holder col-sm-12 col-md-6 col-lg-5">
            <div class="form-content">
                <div class="form-items">
                    <div class="form-row logo-social">
                        <div class="website-logo-inside">
                            <a href="/">
                                <div class="logo">
                                    <img class="logo-size" src="images/logo.jpg" alt="">
                                </div>
                            </a>
                        </div>
                        <div class="col-6">
                            <div class="other-links no-bg-icon">
                                <a href="https://twitter.com/toni.astro" target="blank"><i class="fab fa-twitter"></i></a>
                                <a href="https://instagram.com/toni.astro" target="blank"><i class="fab fa-instagram"></i></a>
                            </div>
                        </div>
                    </div>
                    <h3>Event booking System built on Golang and Vue.</h3>
                    <notifications group="grabbed"  position="top left"/>
                    
                    <form class="form-row" @submit.prevent="handleSubmit">
                        <input class="form-control" :class="{ 'is-invalid': submitted && $v.user.name.$error }" v-model="user.name" type="text" placeholder="Your Name" />
                        <div v-if="submitted && !$v.user.name.error" class="invalid-feedback">
                            <span v-if="!$v.user.name.required">Name is required</span>
                            <span v-if="!$v.user.name.minLength">Name must have at least {{$v.user.name.minLength.min}} letters.</span>
                        </div>
                        <input class="form-control" :class="{ 'is-invalid': submitted && $v.user.email.$error }" v-model="user.email" name='email' placeholder="E-mail Address" />
                        <div v-if="submitted && $v.user.email.$error" class="invalid-feedback">
                            <span v-if="!$v.user.email.required">Email is required</span>
                            <span v-if="!$v.user.email.email">Email is invalid</span>
                        </div>
                                
                        <input class="form-control" :class="{ 'is-invalid': submitted && $v.user.phone.$error }" v-model="user.phone" type="text" placeholder="Phone Number" />
                        <div v-if="submitted && $v.user.phone.$error" class="invalid-feedback">
                            <span v-if="!$v.user.phone.required">Phone number is required</span>
                            <span v-if="!$v.user.phone.minLength">Name must have at least {{$v.user.phone.minLength.min}} characters.</span>
                        </div>
                        <div class="form-button">
                            <button id="submit" type="submit" class="ibtn">
                                Buy Ticket
                            </button>
                        </div>
                    </form>   
                </div>
            </div>
        </div>
        <div class="img-holder-right col-sm-12 col-md-6 col-lg-7">
            <img src="images/logo.jpg" alt="">
        </div>
    </div>
</div> 
</template>
<style>
.error{
color:white;
}

</style>
<script>
import Vue from 'vue'
import { required, minLength,email } from 'vuelidate/lib/validators'
import {API_URL , API_publicKey } from '../http';

var axios = require('axios');

export default {
  name: 'home',
  data() {
        return {
            user: {
                name: "",
                email: "",
                phone: ""
            },
            submitted: false
        };
    },
    validations: {
        user: {
            name: { required, minLength: minLength(3)},
            email: { required, email },
            phone: { required, minLength: minLength(11) }
        }
    },
    methods: {
        loadRave: function () {
            const script = document.createElement('script')
            // for Test Payment, this !!!!!
            script.src ='https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/flwpbf-inline.js'
            // For live payment, this  !!!!!!!
            // script.src = 'https://api.ravepay.co/flwv3-pug/getpaidx/api/flwpbf-inline.js'
            document.getElementsByTagName('head')[0].appendChild(script)
        },
        handleSubmit(e) {
            this.submitted = true;

            // stop here if form is invalid
            this.$v.$touch();
            if (this.$v.$invalid) {
                return e;
            }
            var apiURL = API_URL;

            return new Promise((resolve, reject) => {
                axios.post(apiURL+'initiate', {
                     email: this.user.email,
                     name:  this.user.name,
                     phone: this.user.phone
                })
                .then(response => {
                    if(response.data.status == false ){
                        // console.log (JSON.parse(response.data.message));
                        var result = JSON.parse(response.data.message)
                        Object.keys(result).forEach(function(key) {
                            Vue.notify({
                                group: 'grabbed',
                                title: key,
                                text: result[key]
                            })
                        })
                       
                    }else{
                        Vue.notify({
                            group: 'grabbed',
                            title: 'Details grabbed 🌚😅',
                            text: 'Hi! Redirecting to payment .....'
                        })
                        let data = response.data.details
                        this.payWithRave(data.email, data.phone,data.reference)
                        resolve(response);
                    }
                   
                }, error => {
                    console.log('Promise Signup error:', error);
                    reject(error);
                });
            });
        },
        payWithRave(email,phone,reference) {
            window.getpaidSetup({
                PBFPubKey: API_publicKey,
                customer_email: email,
                amount: 2000,
                customer_phone: phone,
                currency: "NGN",
                txref: reference,
                meta: [{
                    metaname: "Toni Astro",
                    metavalue: "Any extra meta reference "
                }],
                onclose: function() {},
                callback: function(response) {
                    var return_data = response
                    var txref = response.tx.txRef; // collect txRef returned and pass to a 					server page to complete status check.
                    return new Promise((resolve, reject) => {
                        axios.post(API_URL+'verify', {
                            txref: txref
                        })
                        .then(response => {
                            if(response.data.status == false ){
                               
                                 Vue.notify({
                                    group: 'grabbed',
                                    title: 'Error 🌚',
                                    text: 'Hi! Something went wrong, please try again'
                                })
                            }else{    
                                if (return_data.tx.chargeResponseCode == "00" || return_data.tx.chargeResponseCode == "0") {
                                    console.log('Success!!!')
                                    window.close(); 
                                    Vue.notify({
                                        group: 'grabbed',
                                        title: 'Successfull ',
                                        text: 'Hi! Payment was successful.'
                                    })
                                    // redirect to a success page
                                } else {
                                    console.log('Faileddd!!!')
                                    // redirect to a failure page.
                                } 
                                window.close(); 
                            } 
                        }, error => {
                            console.log('Promise Signup error:', error);
                            reject(error);
                        });
                    });   
                }
            });
        }
    },
    beforeMount(){
        this.loadRave()
    }
}
</script>