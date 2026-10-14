import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  Compass, Globe, Layers, ArrowRight, ExternalLink, 
  MapPin, Play, Cpu, CheckCircle2, Terminal, HardDrive 
} from "lucide-react";

export default function Portfolio() {
  const navigate = useNavigate();

  const scrollToCaseStudies = () => {
    const section = document.getElementById("case-studies");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const skillsData = [
    {
      category: "Spatial Analysis & GIS",
      icon: <Globe className="w-5 h-5 text-geoCyan" />,
      accentColor: "border-geoCyan/40 shadow-geoCyan/10",
      description: "Advanced geospatial vector/raster data workflows, remote sensing, and spatial database modeling.",
      skills: [
        "ArcGIS",
        "QGIS",
        "Web GIS (Atlas)",
        "Python (GeoPandas)",
        "Drone & IoT Sensor Mapping",
        "Precision Agriculture",
      ],
    },
    {
      category: "Architectural & Site Design",
      icon: <Compass className="w-5 h-5 text-geoYellow" />,
      accentColor: "border-geoYellow/40 shadow-geoYellow/10",
      description: "Rigorous technical drafting, coordinate geometry, topographical contours, and engineering layout plans.",
      skills: [
        "AutoCAD (2D/3D Drafting)",
        "Topographical Mapping",
        "Technical Surveying",
        "Coordinate Geometry",
        "Site Grading Plans",
        "Orthographic Projection",
      ],
    },
    {
      category: "Map Animation & Cartography",
      icon: <Layers className="w-5 h-5 text-purple-400" />,
      accentColor: "border-purple-500/40 shadow-purple-500/10",
      description: "Cinematic geopolitical motion graphics, custom vector basemaps, and photorealistic 3D terrain modeling.",
      skills: [
        "Adobe After Effects",
        "GEOlayers 3",
        "Mapbox Studio Custom Basemaps",
        "BlenderGIS (3D Terrain)",
        "Cinematic Data Visualization",
        "Digital Elevation Models (DEM)",
      ],
    },
  ];

  return (
    <div className="w-full pb-24 space-y-20">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION
         ───────────────────────────────────────────────────────────── */}
      <section className="relative rounded-[2.5rem] p-8 sm:p-12 md:p-16 border border-white/10 bg-gray-900/50 backdrop-blur-xl bg-coord-grid shadow-2xl overflow-hidden">
        {/* Ambient Radial Glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-geoCyan/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-geoYellow/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
          {/* Glowing Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-geoCyan/10 border border-geoCyan/40 text-geoCyan text-xs font-mono uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(66,194,203,0.2)]"
          >
            <span className="w-2 h-2 rounded-full bg-geoCyan animate-ping"></span>
            <span>GIS • CAD • MOTION CARTOGRAPHY</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl sm:text-5xl md:text-6xl text-white font-extrabold tracking-tight mb-5 leading-tight"
          >
            Translating Complex Spatial Data into{" "}
            <span className="text-geoCyan">Clear Visual Stories.</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-base md:text-lg text-gray-300 font-medium mb-8 max-w-2xl leading-relaxed"
          >
            <span className="text-white font-bold">Sadiq Muhammad Mustapha</span>{" "}
            | GIS Specialist, CAD Drafter & Map Animator.
          </motion.p>

          {/* Dual Call-to-Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full sm:w-auto"
          >
            <button
              onClick={scrollToCaseStudies}
              className="w-full sm:w-auto bg-geoCyan text-gray-900 font-semibold px-8 py-3.5 rounded-xl hover:bg-geoYellow transition-all hover:shadow-[0_0_25px_rgba(66,194,203,0.4)] flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer active:scale-98"
            >
              <span>View Case Studies</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate("/contact")}
              className="w-full sm:w-auto border border-geoCyan/50 text-geoCyan hover:bg-geoCyan/10 transition-all px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Contact Me</span>
            </button>
          </motion.div>

          {/* Quick Professional Network Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center justify-center gap-6 pt-6 border-t border-white/10 w-full max-w-md"
          >
            <a
              href="https://linkedin.com/in/sadiq-muhammad-mustapha-90442b314"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-geoCyan transition-colors flex items-center gap-2 text-xs font-medium"
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <i className="fa-brands fa-linkedin text-xl"></i>
              <span className="hidden sm:inline">LinkedIn</span>
            </a>

            <a
              href="https://github.com/sadiqmdikwa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-geoCyan transition-colors flex items-center gap-2 text-xs font-medium"
              title="GitHub"
              aria-label="GitHub"
            >
              <i className="fa-brands fa-github text-xl"></i>
              <span className="hidden sm:inline">GitHub</span>
            </a>

            <a
              href="https://youtube.com/@geoglobe23"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-geoCyan transition-colors flex items-center gap-2 text-xs font-medium"
              title="YouTube Map Animations"
              aria-label="YouTube"
            >
              <i className="fa-brands fa-youtube text-xl"></i>
              <span className="hidden sm:inline">YouTube</span>
            </a>

            <a
              href="mailto:sadiqmdikwa@gmail.com"
              className="text-gray-400 hover:text-geoCyan transition-colors flex items-center gap-2 text-xs font-medium"
              title="Email Directly"
              aria-label="Email"
            >
              <i className="fa-solid fa-envelope text-lg"></i>
              <span className="hidden sm:inline">Email</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. CATEGORIZED 3-COLUMN SKILLS GRID (NO PROGRESS BARS)
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-geoCyan font-semibold uppercase tracking-wider text-xs mb-1">
              <Cpu className="w-3.5 h-3.5" />
              Core Competencies
            </div>
            <h2 className="text-2xl md:text-3xl text-white font-extrabold tracking-tight">
              Technical Disciplines & Stack
            </h2>
          </div>
          <p className="text-gray-400 text-xs md:text-sm max-w-md">
            Production-grade geospatial analysis, precision engineering CAD, and cinematic cartographic design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skillsData.map((item, idx) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 hover:border-geoCyan/50 hover:shadow-[0_0_25px_rgba(66,194,203,0.15)] transition-all flex flex-col group relative overflow-hidden"
            >
              {/* Subtle top indicator bar */}
              <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:via-geoCyan/60 transition-all"></div>

              {/* Header Icon + Title */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gray-800/80 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-geoCyan transition-colors">
                  {item.category}
                </h3>
              </div>

              <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Clean Skill Pills */}
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                {item.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-black/40 border border-white/5 text-gray-300 hover:text-white hover:border-geoCyan/40 hover:bg-geoCyan/5 transition-all shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. PROJECT GALLERY ("THE WORK" — #case-studies BENTO GRID)
         ───────────────────────────────────────────────────────────── */}
      <section id="case-studies" className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-geoCyan font-semibold uppercase tracking-wider text-xs mb-1">
              <Terminal className="w-3.5 h-3.5" />
              Verified Case Studies
            </div>
            <h2 className="text-2xl md:text-3xl text-white font-extrabold tracking-tight">
              Selected Projects & Deliverables
            </h2>
          </div>
          <p className="text-gray-400 text-xs md:text-sm max-w-md">
            Real-world implementations spanning agricultural remote sensing, engineering drafting, and geopolitical media animations.
          </p>
        </div>

        {/* Staggered Bento-Box Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ─────────────────────────────────────────────────────────────
              PROJECT 1: Precision Mapping & Agriculture (7 Columns)
             ───────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-geoCyan/50 hover:shadow-[0_0_25px_rgba(66,194,203,0.15)] transition-all overflow-hidden flex flex-col group"
          >
            {/* Visual Container */}
            <div className="relative h-60 sm:h-72 overflow-hidden bg-slate-950">
              <img
                src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=1200"
                alt="Precision Agriculture and Drone Spatial Data"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-85"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>

              {/* High-Tech Coordinate Overlay Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-950/80 border border-white/10 backdrop-blur-md text-[11px] font-mono text-gray-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>11.8540° N, 13.1520° E • Multispectral NDVI + Drone LIDAR</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-8 flex flex-col flex-grow">
              <div className="flex items-center gap-2 text-geoCyan text-xs font-semibold uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5" />
                AgriSmart Spatial Analytics
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-geoCyan transition-colors">
                Precision Mapping & Agriculture
              </h3>

              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6">
                AgriSmart IoT and drone spatial data integration for real-time crop health monitoring, soil moisture indexing, and automated yield zone mapping. Designed for precision resource allocation and automated NDVI vegetation stress analysis.
              </p>

              {/* Tech Tags */}
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                {["ArcGIS", "QGIS", "Python GeoPandas", "Drone & IoT"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-geoCyan/10 text-geoCyan border border-geoCyan/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────────
              PROJECT 2: Engineering CAD & Blueprinting (5 Columns)
             ───────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-5 bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-geoCyan/50 hover:shadow-[0_0_25px_rgba(66,194,203,0.15)] transition-all overflow-hidden flex flex-col group"
          >
            {/* Visual Container */}
            <div className="relative h-60 sm:h-72 overflow-hidden bg-slate-950">
              <img
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200"
                alt="Engineering CAD Blueprinting and Topographical Survey"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-85"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>

              {/* High-Tech Scale Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-950/80 border border-white/10 backdrop-blur-md text-[11px] font-mono text-gray-300">
                <HardDrive className="w-3 h-3 text-geoYellow" />
                <span>SCALE 1:100 • 2D/3D Orthographic CAD</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-8 flex flex-col flex-grow">
              <div className="flex items-center gap-2 text-geoYellow text-xs font-semibold uppercase tracking-wider mb-2">
                <Compass className="w-3.5 h-3.5" />
                Technical Civil & Site Design
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-geoYellow transition-colors">
                Engineering CAD & Blueprinting
              </h3>

              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6">
                High-precision 2D/3D architectural floor plans, site grading layouts, and regional topographical survey maps drafted to strict engineering standards with coordinate geometry calibration.
              </p>

              {/* Tech Tags */}
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                {["AutoCAD", "2D/3D Drafting", "Topographical Mapping", "Coordinate Geometry"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-geoYellow/10 text-geoYellow border border-geoYellow/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────────
              PROJECT 3: Dynamic Geovisualization (12 Columns - Split Layout)
             ───────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="lg:col-span-12 bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-geoCyan/50 hover:shadow-[0_0_25px_rgba(66,194,203,0.15)] transition-all overflow-hidden grid grid-cols-1 lg:grid-cols-12 group"
          >
            {/* Visual Container (7 cols on desktop) */}
            <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[260px] overflow-hidden bg-slate-950">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1400"
                alt="3D Relief Map and Cinematic Data Cartography"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-85"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-gray-900 via-transparent to-transparent"></div>

              {/* Glowing Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-950/80 border border-white/10 backdrop-blur-md text-[11px] font-mono text-gray-300">
                <span className="w-2 h-2 rounded-full bg-geoCyan animate-ping"></span>
                <span>GEOlayers 3 + BlenderGIS 3D Mesh</span>
              </div>
            </div>

            {/* Content Details (5 cols on desktop) */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  Cartographic Motion Graphics
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-geoCyan transition-colors">
                  Dynamic Geovisualization
                </h3>

                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6">
                  Cinematic 3D terrain rendering, custom Mapbox vector styling, and animated geopolitical storytelling crafted for the GeoGlobe platform and documentary media. Illustrates frontier disputes, historical border partitions, and global topography.
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {["After Effects", "GEOlayers 3", "Mapbox Studio", "BlenderGIS"].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button linking to /videos */}
              <button
                onClick={() => navigate("/videos")}
                className="w-full sm:w-auto self-start bg-geoCyan hover:bg-geoYellow text-gray-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch Animations in Video Library</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. BOTTOM CONTACT CALLOUT
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-gray-900/80 via-[#0a0f1d] to-gray-900/80 border border-white/10 rounded-3xl p-8 sm:p-10 text-center flex flex-col items-center">
        <h3 className="text-2xl font-bold text-white mb-2">
          Interested in Collaborating on a Spatial Project?
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm max-w-lg mb-6 leading-relaxed">
          Available for GIS consultancy, precision mapping, engineering CAD drafting, and bespoke animated cartography.
        </p>
        <button
          onClick={() => navigate("/contact")}
          className="bg-geoCyan hover:bg-geoYellow text-gray-950 font-bold px-8 py-3 rounded-xl transition-all text-sm flex items-center gap-2 shadow-lg shadow-geoCyan/20 cursor-pointer"
        >
          <span>Get in Touch with Sadiq</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}
