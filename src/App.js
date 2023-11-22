import React, {Component} from "react";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import ParticlesBg from 'particles-bg'
import './App.css';
import 'tachyons';


const initialState = {
    input: '',
    imageURL: '',
    box: {},
    route: 'signin',
    isSignedin: false,
    user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = initialState;
    }


    loadUser=(data)=>{
        this.setState({user:{
             id : data.id,
            name : data.name,
            email : data.email,
            entries: data.entries,
            joined :data.joined
    }})
}

    calculateFaceLocation = (data) =>{
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const height = Number(image.height);
        const width = Number(image.width);
        return{
            leftCol : clarifaiFace.left_col * width ,
            topRow : clarifaiFace.top_row * height ,
            rightCol : width - ( clarifaiFace.right_col *width ) ,
            bottomRow : height - (clarifaiFace.bottom_row * height),
        }
    }
    displayFaceBox = (box) =>{
        this.setState({box : box})
        // console.log(box);
    }
    onInputChange = (event) => {
        this.setState({input : event.target.value})
    }

    onButtonSubmit = () =>{
        this.setState({imageUrl: this.state.input })
        fetch('https://face-rec-u55m.onrender.com/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                input: this.state.input
            })
        })
            .then(response => response.json())
            .then(result => {
                if (result) {
                    fetch('https://backend-face-rec-api.onrender.com/image', {
                        method: 'put',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            id: this.state.user.id
                        })
                    })
                        .then(response =>response.json())
                        .then(count => {
                            this.setState(Object.assign(this.state.user,{entries:count}))
                        })
                    this.displayFaceBox(this.calculateFaceLocation(result));
                }
            })
            .catch(error => console.log('error', error));
    }
    onRouteChange = (route) =>{
        if (route==='signout'){
            this.setState({isSignedIn:false})
            this.setState(initialState)
            // console.log(initialState)
        } else if (route==='home'){
            this.setState({isSignedIn:true})
        }
        this.setState({route :route});
    }

    render(){
        return (
            <div className="App">
                <ParticlesBg type="circle" bg={true} />
                <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
                {this.state.route === 'home'
                ? <div>
                        <Logo />
                        <Rank
                            name={this.state.user.name}
                            entries={this.state.user.entries}
                        />
                        <ImageLinkForm
                            onInputChange={this.onInputChange}
                            onButtonSubmit={this.onButtonSubmit}
                        />
                        <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
                </div>
                :   (
                        this.state.route === 'signin'
                        ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                    )
                }
            </div>
        );
    }
}

export default App;
