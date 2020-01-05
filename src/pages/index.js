import React, {Component} from "react"
import ReactDOM from 'react-dom';
import { Helmet } from "react-helmet"
import mapboxgl from 'mapbox-gl'
import * as syncmaps from '@mapbox/mapbox-gl-sync-move'
import 'mapbox-gl/dist/mapbox-gl.css';
import 'mapbox-gl-compare/dist/mapbox-gl-compare.css';
import { bbox } from '@turf/turf'

import OnTimeContainer from "../components/OnTimeContainer"

mapboxgl.accessToken = 'pk.eyJ1Ijoic2FhZGlxbSIsImEiOiJjamJpMXcxa3AyMG9zMzNyNmdxNDlneGRvIn0.wjlI8r1S_-xxtq2d-W5qPA';

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

class TransitData extends Component {

  constructor(props) {
    super(props);
    this.state = {
      route:4,
      time:"afternoon",
      days:"weekdays",
      direction: null,
      direction_id:null,
      booking: "CT19",
      data: null,
      isLoaded: false,
    };

    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleDayChange = this.handleDayChange.bind(this);
    this.handleRouteChange = this.handleRouteChange.bind(this);
    this.handleDirectionChange = this.handleDirectionChange.bind(this);
  }

  componentDidMount() {
    this.map1 = new mapboxgl.Map({
      container: this.before,
      style: 'mapbox://styles/saadiqm/cjfnjiowo0zj62rpj0y1qpib0',
      center: [-114.0708, 51.0486],
      zoom:11
    });

    this.map2 = new mapboxgl.Map({
      container: this.after,
      style: 'mapbox://styles/saadiqm/cjfnjiowo0zj62rpj0y1qpib0',
      center: [-114.0708, 51.0486],
      zoom:11
    });

    syncmaps(this.map1, this.map2);

    fetch('https://r86qfhxjpg.execute-api.us-west-2.amazonaws.com/dev/route?short_name='+this.state.route+'&time='+this.state.time+'&days='+this.state.days)
      .then(response => response.json())
      .then(data => {

        let headsigns = data.features.map(item => item.properties.headsign)
        headsigns = headsigns.filter(onlyUnique)

        this.setState({data:data,isLoaded:true,direction:headsigns[0]})
        let bounds= bbox(data);
        let padding = {padding: {top: 40, bottom:40, left: 40, right: 40}} //find bounding box using Turf
        this.map1.fitBounds(bounds,padding);
        this.map2.fitBounds(bounds,padding);
      });

    this.map1.on('load', () => {

      this.map1.addSource('OnTimeData', {
        type: 'geojson',
        data: this.state.data
      });

      this.map2.addSource('OnTimeData', {
        type: 'geojson',
        data: this.state.data
      });

      this.map1.addSource('bus-2018', {
        type: 'geojson',
        data: "https://axushgcci2.execute-api.us-east-1.amazonaws.com/dev/shape/?route="+this.state.route+"&year=2018&direction="+this.state.direction
      });

      this.map2.addSource('bus-2019', {
        type: 'geojson',
        data: "https://axushgcci2.execute-api.us-east-1.amazonaws.com/dev/shape/?route="+this.state.route+"&year=2019&direction="+this.state.direction
      });

      this.map1.addLayer({
        "id": "Bus Route 2018",
        "type": "line",
        "source": 'bus-2018',
        "paint": {
            "line-color": "black",
            "line-width": 2,
            "line-opacity": 0.4
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
      });

      this.map2.addLayer({
        "id": "Bus Route 2019",
        "type": "line",
        "source": 'bus-2019',
        "paint": {
            "line-color": "black",
            "line-width": 2,
            "line-opacity": 0.4
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
      });

      this.map1.addLayer({
          "id": "OnTimeData_2018",
          "type": "circle",
          "source": "OnTimeData",
          "paint": {
            'circle-radius':[
              'interpolate', ["exponential", 2], ['zoom'],
              6,10,
              10,['/',['get', 'diff'],10],
              15,10
            ],
            'circle-color': [
              'match',
              ['get', 'sign'],
              1,
              '#ff2b2b',
              -1,
              '#2b5cff',
              /* other */ '#ccc'
            ],
            'circle-opacity': 0.35,
          },
          filter:['all',['==', 'booking', "CT6"],['==', 'headsign', this.state.direction]]
      });

      this.map2.addLayer({
          "id": "OnTimeData_2019",
          "type": "circle",
          "source": "OnTimeData",
          "paint": {
            'circle-radius':[
              'interpolate', ["exponential", 2], ['zoom'],
              6,10,
              10,['/',['get', 'diff'],10],
              15,10
            ],
            'circle-color': [
              'match',
              ['get', 'sign'],
              1,
              '#ff2b2b',
              -1,
              '#2b5cff',
              /* other */ '#ccc'
            ],
            'circle-opacity': 0.35,
          },
          filter:['all',['==', 'booking', "CT19"],['==', 'headsign', this.state.direction]]
      });



    })

    this.popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: 'bottom-left'
    });


    this.map1.on('mouseenter', 'OnTimeData_2018', this.popUpEnter1.bind(this));
    this.map1.on('mouseleave', 'OnTimeData_2018', this.popUpLeave1.bind(this));

    this.map2.on('mouseenter', 'OnTimeData_2019', this.popUpEnter2.bind(this));
    this.map2.on('mouseleave', 'OnTimeData_2019', this.popUpLeave2.bind(this));


  }

  popUpEnter1(e){
    this.map1.getCanvas().style.cursor = 'pointer';
    var coordinates = e.features[0].geometry.coordinates.slice();
    var diff = Math.round(e.features[0].properties.diff/60);
    var sign = String(e.features[0].properties.sign);

    sign = (sign > 0) ? "late" : "early";

    let text = null;

    if(diff < 1){
      text = <div className="prose">
      <p className="txt-h5 txt-bold">On time</p>
      </div>
    }else{
      text = <div className="prose">
      <p className="txt-h5 txt-bold">{diff} minutes {sign}</p>
      </div>
    }

    const placeholder = document.createElement('div');
    ReactDOM.render(text, placeholder);

    this.popup.setLngLat(coordinates).setDOMContent(placeholder).addTo(this.map1);
  }


  popUpLeave1(e){
    this.map1.getCanvas().style.cursor = '';
    this.popup.remove();
  }

  popUpEnter2(e){
    this.map2.getCanvas().style.cursor = 'pointer';
    var coordinates = e.features[0].geometry.coordinates.slice();
    var diff = Math.round(e.features[0].properties.diff/60);
    var sign = String(e.features[0].properties.sign);

    sign = (sign > 0) ? "late" : "early";

    let text = null;

    if(diff < 1){
      text = <div className="prose">
      <p className="txt-h5 txt-bold">On time</p>
      </div>
    }else{
      text = <div className="prose">
      <p className="txt-h5 txt-bold">{diff} minutes {sign}</p>
      </div>
    }


    const placeholder = document.createElement('div');
    ReactDOM.render(text, placeholder);

    this.popup.setLngLat(coordinates).setDOMContent(placeholder).addTo(this.map2);
  }


  popUpLeave2(e){
    this.map2.getCanvas().style.cursor = '';
    this.popup.remove();
  }

  handleTimeChange(e) {
    e.preventDefault();
    this.setState({time:e.target.value}, () => {

      fetch('https://r86qfhxjpg.execute-api.us-west-2.amazonaws.com/dev/route/?short_name='+this.state.route+'&time='+this.state.time+'&days='+this.state.days)
        .then(response => response.json())
        .then(data => {
          this.setState({data})
          this.map1.getSource('OnTimeData').setData(data)
          this.map2.getSource('OnTimeData').setData(data)
        });
    });
  }


  handleDayChange(e) {
    e.preventDefault();
    this.setState({days:e.target.value}, () => {

      fetch('https://r86qfhxjpg.execute-api.us-west-2.amazonaws.com/dev/route/?short_name='+this.state.route+'&time='+this.state.time+'&days='+this.state.days)
        .then(response => response.json())
        .then(data => {
          this.setState({data})
          this.map1.getSource('OnTimeData').setData(data)
          this.map2.getSource('OnTimeData').setData(data)
        });
    });
  }

  handleDirectionChange(e) {
    e.preventDefault();
    this.setState({direction:e.target.value}, () => {

      this.map1.setFilter("OnTimeData_2018",['all',['==', 'booking', "CT6"],['==', 'headsign', this.state.direction]])
      this.map2.setFilter("OnTimeData_2019",['all',['==', 'booking', "CT19"],['==', 'headsign', this.state.direction]])

      this.map1.getSource('bus-2018').setData("https://axushgcci2.execute-api.us-east-1.amazonaws.com/dev/shape/?route="+this.state.route+"&year=2018&direction="+this.state.direction)
      this.map2.getSource('bus-2019').setData("https://axushgcci2.execute-api.us-east-1.amazonaws.com/dev/shape/?route="+this.state.route+"&year=2019&direction="+this.state.direction)

    })
  }

  handleRouteChange(e) {
    e.preventDefault();
    this.setState({route:e.target.value}, () => {

      fetch('https://r86qfhxjpg.execute-api.us-west-2.amazonaws.com/dev/route/?short_name='+this.state.route+'&time='+this.state.time+'&days='+this.state.days)
        .then(response => response.json())
        .then(data => {

          let headsigns = data.features.map(item => item.properties.headsign)
          headsigns = headsigns.filter(onlyUnique)

          this.setState({data:data,isLoaded:true,direction:headsigns[0]},()=>{

            this.map1.getSource('OnTimeData').setData(data)
            this.map2.getSource('OnTimeData').setData(data)

            this.map1.getSource('bus-2018').setData("https://axushgcci2.execute-api.us-east-1.amazonaws.com/dev/shape/?route="+this.state.route+"&year=2018&direction="+this.state.direction)
            this.map2.getSource('bus-2019').setData("https://axushgcci2.execute-api.us-east-1.amazonaws.com/dev/shape/?route="+this.state.route+"&year=2019&direction="+this.state.direction)

            this.map1.setFilter("OnTimeData_2018",['all',['==', 'booking', "CT6"],['==', 'headsign', this.state.direction]])
            this.map2.setFilter("OnTimeData_2019",['all',['==', 'booking', "CT19"],['==', 'headsign', this.state.direction]])

            let bounds= bbox(data);

            let padding = {padding: {top: 40, bottom:40, left: 40, right: 40}}

            this.map1.fitBounds(bounds,padding);
            this.map2.fitBounds(bounds,padding);


          })

        });
    });
  }

  render(){

    return(
      <div>
        <Helmet>
          <link href="https://api.mapbox.com/mapbox-assembly/v0.23.2/assembly.min.css" rel="stylesheet"/>
        </Helmet>

      <div ref={el => this.before = el} style={{position: 'absolute',top: 0, bottom: 0, width: '50%',left:"50%",borderLeft: "1px solid #ccc"}}></div>
       <div ref={el => this.after = el} style={{position: 'absolute',top: 0,bottom: 0,width: '50%'}}/>

       <div className='color-white txt-h4 txt-bold flex-parent flex-parent--center-cross flex-parent--center-main  absolute top left ml30 mt30 w120 h30 bg-gray round shadow-darken25'><div className='flex-child'>2019</div></div>
        <div className='color-white txt-h4 txt-bold flex-parent flex-parent--center-cross flex-parent--center-main absolute top right mr36 mt36 w120 h30 bg-gray round shadow-darken25'><div className='flex-child'>2018</div></div>

      {this.state.isLoaded && (<OnTimeContainer
        data={this.state.data}
        time={this.state.time}
        onTimeChange={this.handleTimeChange}
        day={this.state.DayValue}
        onDayChange={this.handleDayChange}
        route={this.state.route}
        onRouteChange={this.handleRouteChange}
        onDirectionChange={this.handleDirectionChange}
        direction={this.state.direction}
      />)}

      </div>
    );
  }

}

export default TransitData
