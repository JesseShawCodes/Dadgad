import Image from "next/image";
import HomePageContent from './components/HomePageContent';

export default function Home() {
  const classNames = "min-vh-100 d-flex flex-column justify-content-center";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <HomePageContent classNames={classNames}/>
    </div>
  );
}
