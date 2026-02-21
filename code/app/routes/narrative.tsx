// provides type safety/inference
import type { Route } from "./+types/narrative";
import { useState } from 'react';
import { generateNarrative } from "../narrative/ai";

export default function Component({}: Route.ComponentProps) {
  return <NarrativeView />;
}

function NarrativeView(){

  // later - make these props to be sent from upper-level view
  const [clientNum, setClientNum] = useState('');
  const [matterNum, setMatterNum] = useState('');
  const [taskCode, setTaskCode] = useState('');
  const [activityCode, setActivityCode] = useState('');
  const [internalNarrative, setInternalNarrative] = useState('');
  const [externalNarrative, setExternalNarrative] = useState('');
  const [timerHours, setTimerHours] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);

  async function handleSubmit() {
    // e.preventDefault(); 
    console.log("handleSubmit called")
    const result = await generateNarrative(internalNarrative);
    console.log("returned: ", result)
    setExternalNarrative(result);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12, margin:"1%", width:'50%', border:'2px #a6a5a5 solid', padding:'1%' }}>
      <h1 style={{ marginBottom: 8, fontSize: 18, fontWeight: 600 }}>
        Smith v. Johnson – Contract Dispute
      </h1>
      <form className="flex flex-col">
        <div className="formField" >
          <label htmlFor="timer" className="formLabel">Timer (HH:MM:SS)</label>
          <div className="duration-picker">
            <input 
              className="timerInput" 
              type="number" 
              min="0" 
              placeholder="HH" 
              value={timerHours}
              onChange={(e) => setTimerHours(Number(e.target.value))}
            >
            </input>
            :
            <input 
              className="timerInput" 
              type="number" 
              min="0" 
              max="59" 
              placeholder="MM" 
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(Number(e.target.value))}
            >
            </input>
            :
            <input 
              className="timerInput" 
              type="number" 
              min="0" max="59" 
              placeholder="SS" 
              value={timerSeconds}
              onChange={(e) => setTimerSeconds(Number(e.target.value))}
            >
            </input>
          </div>
          {/* <input className="formInput"
            id='clientNo'
            type='text'
            placeholder='e.g. TH46585HD'
            value={clientNum}
            onChange={(e) => setClientNum(e.target.value)}
          ></input> */}
        </div>
        <div className="formField" >
          <label htmlFor="clientNo" className="formLabel">Client number</label>
          <input className="formInput"
            id='clientNo'
            type='text'
            placeholder='e.g. TH46585HD'
            value={clientNum}
            onChange={(e) => setClientNum(e.target.value)}
          ></input>
        </div>
        <div className="formField" >
          <label htmlFor="matterNo" className="formLabel">Matter number</label>
          <input className="formInput"
            id='matterNo'
            type='text'
            placeholder='e.g. 56789'
            value={matterNum}
            onChange={(e) => setMatterNum(e.target.value)}
          ></input>
        </div>
        <div className="formField" >
          <label htmlFor="taskCode" className="formLabel">Task Code</label>
          <input className="formInput"
            id='taskCode'
            type='text'
            placeholder=''
            value={taskCode}
            onChange={(e) => setTaskCode(e.target.value)}
          ></input>
        </div>
        <div className="formField">
          <label htmlFor="activCode" className="formLabel">Activity Code</label>
          <input className="formInput"
            id='activCode'
            type='text'
            placeholder=''
            value={activityCode}
            onChange={(e)=> setActivityCode(e.target.value)}
          ></input>
        </div>
        <div className="formField">
          <label htmlFor="intNarr" className="formLabel">Narrative (internal) </label>
          <textarea className="formInput"
            id='intNarr'
            rows={5}
            placeholder='Your narrative here...'
            value={internalNarrative}
            onChange={(e) => setInternalNarrative(e.target.value)}
          ></textarea>
        </div>
        <div className="formField">
          <button id="rewrite" type="button" className="formButton button" onClick={handleSubmit}>Generate client-facing narrative</button>
          <label className="formNote">Note: this will overwrite any existing external narrative.</label>
        </div>
        <div className="formField">
          <label htmlFor="extNarr" className="formLabel">Narrative (client-facing)</label>
          <textarea className="formInput"
            id='extNarr'
            rows={4}
            placeholder=''
            value={externalNarrative}
            onChange={(e) => setExternalNarrative(e.target.value)}
          ></textarea>
        </div>
        <div className="formField">
          <button id="save" className="formButton button">Save and close</button>
          <button id="save" className="formButton button">Close without saving</button>
        </div>
      </form>
  </div>
  )
}