const portfolioData = {
    bio: {
        name: "MANOJ MOHAN",
        firstName: "MANOJ",
        lastName: "MOHAN",
        title: "SENIOR SOFTWARE DEVELOPER",
        summary: "Specializing in the intersection of high-performance data visualization and scalable cloud infrastructure. 8+ years of engineering robust digital systems at CanvasJS.",
        socials: [
            { name: "GITHUB", link: "https://github.com/manojmohangit", icon: "github" },
            { name: "LINKEDIN", link: "https://www.linkedin.com/in/manumanui07/", icon: "linkedin" },
            { name: "MEDIUM", link: "https://manojmohandev.medium.com/", icon: "medium" },
            { name: "DEV.TO", link: "https://dev.to/manoj_004d", icon: "dev" }
        ],
        contact: "manoj.mohandev@gmail.com"
    },
    experience: [
        {
            company: "CANVASJS (FENOPIX)",
            role: "SENIOR SOFTWARE DEVELOPER",
            period: "2023 — PRESENT",
            description: "Leading the development of industry-standard JavaScript charting libraries. Architected the StockChart API and Chart Studio from the ground up."
        },
        {
            company: "CANVASJS (FENOPIX)",
            role: "SOFTWARE DEVELOPER",
            period: "2017 — 2023",
            description: "Delivered scalable web solutions and data-driven applications for international clients."
        }
    ],
    projects: [
        {
            id: "01",
            title: "MAA SAHELI",
            description: "Maternal health connectivity platform focusing on real-time partner synchronization and health tracking.",
            tech: ["FIREBASE", "FLUTTER"],
            link: "https://maasaheli.manojmohan.dev/"
        },
        {
            id: "02",
            title: "GROCERY HUB",
            description: "Intelligent inventory management system designed to optimize household grocery tracking and planning.",
            tech: ["TYPESCRIPT", "VITE", "REACT"],
            link: "https://groceryhub.manojmohan.dev/"
        },
        {
            id: "03",
            title: "NPM STATS ANALYZER",
            description: "High-density data visualization platform for NPM package telemetry. Built with performance as a primary constraint.",
            tech: ["CANVASJS", "JAVASCRIPT", "REST_API"],
            link: "https://manojmohan.dev/compare-npm-download-stats/"
        },
        {
            id: "04",
            title: "CUSTOM FIELD AUDITOR",
            description: "Enterprise-grade WordPress security utility for post metadata revision tracking and auditing.",
            tech: ["WORDPRESS", "PHP", "MYSQL"],
            link: "https://github.com/manojmohangit/custom-field-auditor"
        }
    ],
    certifications: [
        {
            issuer: "IBM",
            name: "DATA WAREHOUSE FUNDAMENTALS",
            id: "7SNZE9JXXS4E",
            link: "https://www.coursera.org/account/accomplishments/records/7SNZE9JXXS4E"
        },
        {
            issuer: "META",
            name: "REACT BASICS",
            id: "G7MCPDLYXU0V",
            link: "https://www.coursera.org/account/accomplishments/records/G7MCPDLYXU0V"
        },
        {
            issuer: "FREECODECAMP",
            name: "JS ALGORITHMS & DATA STRUCTURES",
            id: "JS-ADS-07",
            link: "https://freecodecamp.org/certification/manojmani07/javascript-algorithms-and-data-structures"
        },
        {
            issuer: "SCRIMBA",
            name: "LEARN TYPESCRIPT",
            id: "OMN56IY8XT3D",
            link: "https://www.coursera.org/account/accomplishments/records/OMN56IY8XT3D"
        }
    ]
};

if (typeof window !== 'undefined') {
    window.portfolioData = portfolioData;
}
