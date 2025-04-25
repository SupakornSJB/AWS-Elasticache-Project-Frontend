import { ChangeEvent, useEffect, useState } from 'react'
import './App.css'
import { v4 as uuidv4 } from 'uuid';

interface IReturnedData {
  source: string,
  hostname: string,
  data: IMockData[]
}

interface IMockData {
  id: number,
  first_name: string,
  last_name: string,
  ip_address: string,
  gender: string
}

function App() {
  const [clientId, setClientId] = useState("");
  const [queryString, setQueryString] = useState("");
  const [shownResult, setShownResult] = useState<IReturnedData | null>();
  const [time, setTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isGlobalCache, setIsGlobalCache] = useState(false);

  useEffect(() => {
    const localId = localStorage.getItem("clientId");
    if (localId) {
      setClientId(localId);
      return;
    }

    const newId = uuidv4();
    localStorage.setItem("clientId", newId);
    setClientId(newId);
  }, [])

  const fetchSearch = () => {
    setIsLoading(true);
    setIsError(false);
    const initTime = performance.now();
    let url = import.meta.env.VITE_BACKEND_URK + '/search/' + queryString;
    if (!isGlobalCache) {
      url += '/' + clientId;
    }

    fetch(url)
      .then(data => data.json())
      .then((data) => {
        setShownResult(data);
        setTime(performance.now() - initTime);
      }).catch(() => {
        setIsError(true);
      }).finally(() => {
        setIsLoading(false);
      });
  }

  const flushCache = () => {
    setIsLoading(true);
    setIsError(false);
    let url = import.meta.env.VITE_BACKEND_URL + '/cache/flush';
    if (!isGlobalCache) {
      url += '/' + clientId;
    }

    fetch(url)
      .finally(() => {
        setIsLoading(false);
      });
  }

  const onQueryStringChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQueryString(event.target.value)
  }

  return (
    <>
      <div className='flex justify-between items-center gap-2'>
        <div className='grow-1'>
          <fieldset className="fieldset border-base-300 rounded-box border p-4">
            <legend className="fieldset-legend">Search</legend>
            <div className='flex gap-2'>
              <input type="text" onChange={onQueryStringChange} value={queryString} className='input w-full' />
              <button onClick={fetchSearch} className='btn btn-primary ' disabled={queryString === ""}>Fetch</button>
            </div>
            <p className="label">(Required)</p>
          </fieldset>
        </div>
        <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4 grow-1">
          <legend className="fieldset-legend">Global Cache</legend>
          <label className="label">
            <input type="checkbox" checked={isGlobalCache} className="toggle toggle-secondary" onChange={(event) => setIsGlobalCache(event.target.checked)} />
            Checking this will affect
            the cache used by all user
          </label>
          <button onClick={flushCache} className='btn btn-dash btn-secondary mt-2'>{isGlobalCache ? "Flush ALL Cache" : "Flush My Cache"}</button>
        </fieldset>
      </div>
      {
        shownResult &&
        <>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Time</div>
              <div className="stat-value">{time.toFixed(2)} ms</div>
              <div className="stat-desc">Time until request finished</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Hostname</div>
              <div className="stat-value">{shownResult.hostname}</div>
              <div className="stat-desc">Hostname of EC2 instance this request is served from</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Source</div>
              <div className="stat-value">{shownResult.source}</div>
              <div className="stat-desc">Source of the data (Redis/SQL)</div>
            </div>
          </div>
        </>
        // <div>
        //   <span>Time: {time}</span>
        //   {shownResult.source && <span>Source: {shownResult?.source}</span>}
        //   {shownResult.hostname && <span>Hostname: {shownResult?.hostname}</span>}
        // </div>
      }
      {
        isLoading && <h1 className='text-3xl font-bold'>Loading...</h1>
      }
      {
        isError && <h1 className='text-3xl font-bold text-red-500'>An Error Has Occurred</h1>
      }
      <>
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
          <table className='table'>
            <thead>
              <tr>
                <th>Id</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Gender</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {
                (shownResult?.data && shownResult.data.length) ?
                  (shownResult.data.map((data) => (
                    <tr key={data.id}>
                      <td>{data.id}</td>
                      <td>{data.first_name}</td>
                      <td>{data.last_name}</td>
                      <td>{data.gender}</td>
                      <td>{data.ip_address}</td>
                    </tr>
                  ))) : null
              }
            </tbody>
          </table>
          {
            !shownResult || !shownResult.data || !shownResult.data.length && <h1 className='text-3xl text-red-500 font-bold'>No Data</h1>
          }
        </div>
      </>
    </>
  )
}

export default App
