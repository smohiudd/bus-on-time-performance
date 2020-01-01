import React from "react"
import onTimeStyles from "./OnTimeContainer.module.css"




function SelectRoute(props){

    let times = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 100, 102, 103, 104, 105, 107, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 123, 124, 125, 126, 127, 129, 133, 134, 135, 136, 138, 142, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 161, 164, 167, 168, 169, 174, 176, 178, 181, 182, 201, 202, 299, 300, 301, 302, 303, 305, 306, 307, 402, 404, 406, 408, 409, 410, 411, 412, 414, 421, 422, 430, 439, 440, 444];

    let optionItems = times.map((route) => <option key={route} value={route}>{route}</option>);

    return(
      <div className="inline-block mr12">
        <div className="select-container">
          <select onChange={props.handleRouteChange} value={props.routeValue} className="select select--border-yellow mb12 txt-s">
                {optionItems}
          </select>
          <div className="select-arrow"></div>
        </div>
      </div>
    )
}


function SelectDirection(props){

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    let headsigns = props.data.features.map(item => item.properties.headsign)
    headsigns = headsigns.filter(onlyUnique)

    let optionItems = headsigns.map((direction) => <option key={direction} value={direction}>{direction}</option>);

    return(
      <div className="inline-block mr12">
        <div className="select-container">
          <select onChange={props.handleDirectionChange} value={props.directionValue} className="select select--border-yellow w120 txt-s">
                {optionItems}
          </select>
          <div className="select-arrow"></div>
        </div>
      </div>
    )
}


function SelectTime(props){

    let times = ['morning','afternoon'];

    let optionItems = times.map((time) => <option key={time} value={time}>{time}</option>);

    return(
      <div className="inline-block mr12">
        <div className="select-container">
          <select onChange={props.handleTimeChange} value={props.timeValue} className="select select--border-yellow txt-s">
                {optionItems}
          </select>
          <div className="select-arrow"></div>
        </div>
      </div>
    )
}

function SelectDay(props){

    let times = ['weekdays','weekend'];

    let optionItems = times.map((day) => <option key={day} value={day}>{day}</option>);

    return(
      <div className="inline-block mr12">
        <div className="select-container">
          <select onChange={props.handleDayChange} value={props.dayValue} className="select select--border-yellow txt-s">
                {optionItems}
          </select>
          <div className="select-arrow"></div>
        </div>
      </div>
    )
}


function OnTimeContainer(props) {
  return (
    <div className={onTimeStyles.container}>
      <div>
        <div className={onTimeStyles.title}>Calgary Transit <br/> On-Time Performance</div>
        <div className={onTimeStyles.subtitle}>Comparison of average on-time performance deviation in seconds between April and June for 2018 and 2019</div>
        <SelectRoute routeValue={props.route} handleRouteChange={props.onRouteChange}/>
        <SelectDirection data={props.data} directionValue={props.direction} handleDirectionChange={props.onDirectionChange}/>
        <SelectTime timeValue={props.time} handleTimeChange={props.onTimeChange} />
        <SelectDay dayValue={props.day} handleDayChange={props.onDayChange} />

          <div className='w300 round px6 py6 txt-s'>
              <div className='flex-parent flex-parent--center-main flex-parent--center-cross align-center'>
                <div className='flex-child flex-child--grow wmin24'>
                  <span className='inline-block w18 h18 round-full bg-blue'></span>
                </div>
                <div className='flex-child flex-child--grow wmin24'>
                  <span className='inline-block w12 h12 round-full bg-blue'></span>
                </div>
                <div className='flex-child flex-child--grow wmin24'>
                  <span className='inline-block w6 h6 round-full bg-blue'></span>
                </div>
                <div className='flex-child flex-child--grow wmin24'>
                  <span className='inline-block w6 h6 round-full bg-red'></span>
                </div>
                <div className='flex-child flex-child--grow wmin24'>
                  <span className='inline-block w12 h12 round-full bg-red'></span>
                </div>
                <div className='flex-child flex-child--grow wmin24'>
                  <span className='inline-block w18 h18 round-full bg-red'></span>
                </div>
              </div>
              <div className='grid txt-s align-center txt-bold'>
                <div className='col wmin24'>Early</div>
                <div className='col wmin24'></div>
                <div className='col wmin24'></div>
                <div className='col wmin24'></div>
                <div className='col wmin24'></div>
                <div className='col wmin24'>Late</div>
              </div>
            </div>

      </div>
    </div>
  )
}

export default OnTimeContainer
