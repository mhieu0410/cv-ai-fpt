"use client";
import Spline from '@splinetool/react-spline';

export const SplineScene = () => {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none md:pointer-events-auto">
      <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
    </div>
  );
};
