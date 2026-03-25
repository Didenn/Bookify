export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F6F8] p-4 text-[#1a1a1a] font-sans">
            <div className="w-full max-w-[400px]">
                <div className="mb-6 text-center">
                    <img 
                        src="/images/logolara.png" 
                        alt="Bookify Logo" 
                        className="h-12 w-12 mx-auto rounded-xl"
                    />
                </div>
                <div className="rounded-xl bg-white px-8 py-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] ring-1 ring-slate-200/50">
                    {children}
                </div>
            </div>
        </div>
    );
}
