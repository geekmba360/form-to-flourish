export const CompanyLogosSection = () => {
  const companies = [
    { name: "Amazon", color: "text-[#FF9900]" },
    { name: "Google", color: "text-[#4285F4]" },
    { name: "Meta", color: "text-[#0668E1]" },
    { name: "Microsoft", color: "text-[#00A4EF]" },
    { name: "Apple", color: "text-foreground" },
    { name: "Netflix", color: "text-[#E50914]" },
    { name: "OpenAI", color: "text-foreground" },
    { name: "Anthropic", color: "text-foreground" },
    { name: "NVIDIA", color: "text-[#76B900]" },
  ];

  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-sm text-muted-foreground mb-8 font-medium">
          Trusted by candidates interviewing at top companies
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {companies.map((company) => (
            <div
              key={company.name}
              className="text-2xl md:text-3xl font-bold opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              <span className={company.color}>{company.name}</span>
            </div>
          ))}
          
          <div className="text-sm font-medium text-muted-foreground bg-card px-6 py-3 rounded-full border border-border max-w-2xl">
            Plus many more startups, high growth companies across multiple industries in technology, health care, management consulting, and more
          </div>
        </div>
      </div>
    </section>
  );
};
