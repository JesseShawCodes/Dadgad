"use client"
import React, { useState } from 'react';
import useSWR from 'swr';

import Loading from '../components/Loading';
import ArtistCardSkeleton from '../components/skeleton_loaders/ArtistCardSkeleton';
import ArtistSearchCard from '../components/ArtistSearchCard';

const fetcher = (url) => fetch(url).then((res) => res.json());

function SearchPage() {
  const [query, setQuery] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: statusData, error: swrError } = useSWR(
    taskId ? `${process.env.NEXT_PUBLIC_SERVER}api/task-status?q=${taskId}` : null,
    fetcher,
    { 
      refreshInterval: (data) => (data?.status === 'SUCCESS' || data?.status === 'FAILURE') ? 0 : 2000,
    }
  );

  const isPolling = taskId && (!statusData || (statusData.status !== 'SUCCESS' && statusData.status !== 'FAILURE'));

  const handleSearch = async () => {
    debugger
    setTaskId(null);
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/artist?q=${query}`);
      const result = await res.json();
      debugger;
      setTaskId(result.task_id);
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };


  const artistList = (res) => res.result.results.artists.data.map((artistResult) => (<ArtistSearchCard key={artistResult.id} artistResult={artistResult}/>));

  const results = statusData?.status === 'SUCCESS' ? statusData : null;

  return (
    <div className="my-4 w-90 mx-auto">
      <div className='container d-flex justify-content-center'>
        <div className=''>
          <h1>Search for Artist</h1>
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className='d-flex justify-content-center'>
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button disabled={isSubmitting} className="btn btn-primary" type="submit">Search</button>
          </form>
        </div>
      </div>

      {error && <p>{error.message}</p>}
      {swrError && <p>Error fetching status: {swrError.message}</p>}

      {(isSubmitting || isPolling) && 
        <div className="container grid d-flex flex-wrap justify-content-center">
          <Loading message="Submitting Search..." />
        </div>
      }

      {statusData && statusData.status === 'PENDING' && (
        <div className="container grid d-flex flex-wrap justify-content-center">
          <ArtistCardSkeleton />
        </div>
      )}

      {results && (
        <div className="container grid d-flex flex-wrap justify-content-center">
          {artistList(results)}
        </div>
      )}

      {statusData && statusData.status === 'FAILURE' && (
        <div className="container grid d-flex flex-wrap justify-content-center">
          <p className="text-danger">There was an error processing your search. Please try again.</p>
          <p>{JSON.stringify(statusData)}</p>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
