// provides type safety/inference
import type { Route } from "./+types/narrative";
import { useState } from 'react';

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

  return (
    <>
      <h1>Name of Timer task</h1>
      <form className="flex flex-col">

        {/* TODO add in the timer */}
        <label htmlFor="clientNo">Client number</label>
        <input
          id='clientNo'
          type='text'
          placeholder='e.g. TH46585HD'
          value={clientNum}
          onChange={(e) => setClientNum(e.target.value)}
        ></input>
              <label htmlFor="matterNo">Matter number</label>
        <input
          id='matterNo'
          type='text'
          placeholder='e.g. 56789'
          value={matterNum}
          onChange={(e) => setMatterNum(e.target.value)}
        ></input>
        <label htmlFor="taskCode">Task Code</label>
        <input
          id='taskCode'
          type='text'
          placeholder=''
          value={taskCode}
          onChange={(e) => setTaskCode(e.target.value)}
        ></input>
              <label htmlFor="activCode">Activity Code</label>
        <input
          id='activCode'
          type='text'
          placeholder=''
          value={activityCode}
          onChange={(e)=> setActivityCode(e.target.value)}
        ></input>
              <label htmlFor="intNarr">Narrative (internal) </label>
        <textarea
          id='intNarr'
          rows={5}
          placeholder='Your narrative here...'
          onChange={(e) => setInternalNarrative(e.target.value)}
        ></textarea>
        <label htmlFor="extNarr">Narrative (client-facing)</label>
        <textarea
          id='extNarr'
          rows={4}
          placeholder=''
          value={externalNarrative}
          onChange={(e) => setExternalNarrative(e.target.value)}
        ></textarea>
        <button id="save" className="button">Save</button>
      </form>
  </>
  )
}