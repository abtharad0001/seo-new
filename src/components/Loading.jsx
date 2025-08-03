export const Loading = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white z-50">
      <div className="animate-spin border-4 border-white border-dashed rounded-full w-16 h-16"></div>
      <span className="mt-4 text-lg">Generating...</span>
    </div>
  );
};
