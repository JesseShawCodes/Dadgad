"use client";

import './App.scss';
import HomePage from './components/HomePage';

export default function Home() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1">
        <HomePage />
      </main>
    </div>
  );
}
