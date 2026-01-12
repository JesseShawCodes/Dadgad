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
    taskId ? `${process.env.NEXT_PUBLIC_SERVER}/api/task-status?q=${taskId}` : null,
    fetcher,
    { 
      refreshInterval: (data) => (data?.status === 'SUCCESS' || data?.status === 'FAILURE') ? 0 : 2000,
    }
  );

  const isPolling = taskId && (!statusData || (statusData.status !== 'SUCCESS' && statusData.status !== 'FAILURE'));

  const handleSearch = async () => {
    setTaskId(null);
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/artist?q=${query}`);
      const result = await res.json();
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
    <div className="min-h-screen my-4 w-11/12 mx-auto">
      <div className='container mx-auto flex justify-center'>
        <div className='text-center'>
          <h1 className="text-4xl font-bold mb-4">Search for Artist</h1>
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className='flex justify-center'>
            <input
              type="text"
              className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md disabled:bg-gray-400"
              type="submit"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {error && <p className="text-red-500 text-center my-4">{error.message}</p>}
      {swrError && <p className="text-red-500 text-center my-4">Error fetching status: {swrError.message}</p>}

      {(isSubmitting || (isPolling && !statusData)) &&
        <div className="container mx-auto flex flex-wrap justify-center">
          <Loading message="Submitting Search..." />
        </div>
      }

      {statusData && (statusData.status === 'PENDING' || statusData.status === 'QUEUED') && (
        <div className="container mx-auto flex flex-wrap justify-center">
          <ArtistCardSkeleton />
        </div>
      )}

      {results && (
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {artistList(results)}
        </div>
      )}

      {statusData && statusData.status === 'FAILURE' && (
        <div className="container mx-auto flex flex-wrap justify-center">
          <p className="text-red-500">There was an error processing your search. Please try again.</p>
          <p>{JSON.stringify(statusData)}</p>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
