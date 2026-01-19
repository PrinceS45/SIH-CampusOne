const Loader = () => {
  return (
    <div className="flex justify-center items-center py-8 space-x-2">
      <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></span>
      <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-150"></span>
      <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-300"></span>
    </div>
  );
};

export default Loader;

