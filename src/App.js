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



const PAT = '6902f7f07b49416384f777e8be34838b';
const USER_ID = 'datnt0609';
const APP_ID = 'test';
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';

const RequestResponse = (imageUrl) =>{
    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": imageUrl
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };
    return requestOptions;
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            input : '',
            imageURL:'',
            box: {},
            route:'signin',
            isSignedin :false,
            user:{
                id : '',
                name : '',
                email : '',
                entries: 0,
                joined :''
            }
        }
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
        fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs",   RequestResponse(this.state.input))
            .then(response => response.json())
            .then(result => {
                if (result) {
                    fetch('http://localhost:3000/image', {
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
