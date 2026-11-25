"use client";

import React, { useEffect, useState } from 'react';

import Loading from '../components/Loading';
import ArtistCardSkeleton from '../components/skeleton_loaders/ArtistCardSkeleton';
import ArtistSearchCard from '../components/ArtistSearchCard';
import {
  useGetTaskStatusQuery,
  useStartSearchMutation,
} from '../services/jsonServerApi';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [stopPolling, setStopPolling] = useState(false);
  const [startSearch, { isLoading: isSubmitting }] = useStartSearchMutation();

  const {
    data: statusData,
    error: taskError,
  } = useGetTaskStatusQuery(taskId as string, {
    skip: !taskId,
    pollingInterval: stopPolling || !taskId ? 0 : 2000,
  });

  const isPolling =
    Boolean(taskId) &&
    !stopPolling &&
    (!statusData ||
      (statusData.status !== 'SUCCESS' && statusData.status !== 'FAILURE'));

  useEffect(() => {
    if (
      statusData?.status === 'SUCCESS' ||
      statusData?.status === 'FAILURE'
    ) {
      setStopPolling(true);
    }
  }, [statusData?.status]);

  useEffect(() => {
    if (taskError) {
      setError(new Error('Error fetching status'));
    }
  }, [taskError]);

  const handleSearch = async () => {
    setTaskId(null);
    setError(null);
    setStopPolling(false);
    try {
      const result = await startSearch(query).unwrap();
      setTaskId(result.task_id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
    }
  };

  const artistList = (res: NonNullable<typeof statusData>) =>
    res.result?.results?.artists?.data?.map((artistResult) => (
      <ArtistSearchCard
        key={artistResult.id}
        artistResult={{
          id: artistResult.id,
          attributes: {
            name: artistResult.attributes?.name || 'Unknown artist',
            artwork: artistResult.attributes?.artwork
              ? {
                  url: artistResult.attributes.artwork.url,
                  width: artistResult.attributes.artwork.width,
                  height: artistResult.attributes.artwork.height,
                }
              : undefined,
          },
        }}
      />
    ));

  const results = statusData?.status === 'SUCCESS' ? statusData : null;

  return (
    <div className="my-4 w-90 mx-auto">
      <div className="container d-flex justify-content-center">
        <div>
          <h1>Search for Artist</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="d-flex justify-content-center"
          >
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search for artist"
            />
            <button
              disabled={isSubmitting || !query.trim()}
              className="btn btn-primary"
              type="submit"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {error && <p>{error.message}</p>}

      {(isSubmitting || (isPolling && !statusData)) && (
        <div className="container grid d-flex flex-wrap justify-content-center">
          <Loading message="Submitting Search..." />
        </div>
      )}

      {statusData &&
        (statusData.status === 'PENDING' || statusData.status === 'QUEUED') && (
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
          <p className="text-danger">
            There was an error processing your search. Please try again.
          </p>
          <p>{JSON.stringify(statusData)}</p>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
