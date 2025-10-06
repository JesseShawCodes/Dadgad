"use client";
import Image from "next/image";
import styles from "./page.module.css";

import { React } from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.scss';
import HomePage from './pages/HomePage';



export default function Home() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1">
        <HomePage />
      </main>
    </div>
  );
}
