"use client";
import React from "react";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      
        <h1 className="text-5xl font-bold text-center sm:text-left">
          Learn with Towhid
        </h1>
        <h2 className="mt-1 text-2xl text-center sm:text-left times text-gray-600 dark:text-gray-400">
          A collection of my learning resources and projects.
      <div
      className="flex items-center justify-center mt-4 font-sans text-xxl text-gray-700 dark:text-gray-300"

      
      >
        <Button
  type="button" 
  className="ml-4 px-6 py-6 rounded-md text-lg text-gray-700 dark:text-gray-300 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300" 
  variant="outline" 
  size="sm"
  onClick = {() => {console.log("Navigating to sorting...");
    router.push('/sorting');}}
>
  Learn Sorting Algorithms
</Button>
        </div>  
        </h2>

    </div>
  );
}
