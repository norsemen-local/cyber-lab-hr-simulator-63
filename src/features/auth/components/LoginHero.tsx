
const LoginHero = () => {
  return (
    <div className="hidden md:flex flex-col items-center justify-center">
      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-xl">
        <img 
          src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81" 
          alt="Team collaborating" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
          <h2 className="text-white text-2xl font-bold">Welcome Back!</h2>
          <p className="text-white/90">Login to access your HR tools and team resources</p>
        </div>
      </div>
    </div>
  );
};

export default LoginHero;
