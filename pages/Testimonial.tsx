import React, { useState, useRef } from 'react';
import { Download, Upload, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Testimonial: React.FC = () => {
  const [formData, setFormData] = useState({
    sutra: '',
    date: new Date().toLocaleDateString('bn-BD'),
    name: '',
    fatherName: '',
    motherName: '',
    designation: 'জুনিয়র গ্রাফিক্স ডিজাইনার',
    salary: '২৫,০০০/- (পঁচিশ হাজার)',
  });

  const [logo, setLogo] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (type === 'logo') setLogo(event.target.result as string);
          else setSignature(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);

    try {
      // Create a PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const pdfHeight = 297;

      const canvas = await html2canvas(printRef.current, {
        scale: 3, // Higher scale for crisp text
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: printRef.current.offsetWidth,
        height: printRef.current.offsetHeight,
        windowWidth: printRef.current.scrollWidth,
        windowHeight: printRef.current.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');

      // Add image to PDF with exact A4 dimensions (0 margin)
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`testimonial-${formData.name || 'draft'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Testimonial Generator</h1>
          <p className="text-slate-500 dark:text-slate-400">Create and download employee testimonials (প্রত্যয়ন পত্র)</p>
        </div>
        <button
          onClick={handleDownloadPdf}
          disabled={isGenerating}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-70"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>Download PDF</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* Input Form */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-y-auto h-fit">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Employee Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Logo</label>
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 w-full text-sm text-slate-600 dark:text-slate-300 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />
                </label>
                {logo && (
                  <button onClick={() => setLogo(null)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sutra (সূত্র)</label>
                <input
                  type="text"
                  name="sutra"
                  value={formData.sutra}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter Sutra No."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date (তারিখ)</label>
                <input
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-slate-700 dark:text-white"
                  placeholder="DD/MM/YYYY"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Employee Name (নাম)</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-slate-700 dark:text-white"
                placeholder="Employee Name in Bangla"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Father's Name (পিতা)</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-slate-700 dark:text-white"
                placeholder="Father's Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mother's Name (মাতা)</label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-slate-700 dark:text-white"
                placeholder="Mother's Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Designation (পদবী)</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Salary (বেতন)</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Signature Upload</label>
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 w-full text-sm text-slate-600 dark:text-slate-300 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Signature
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'signature')} />
                </label>
                {signature && (
                  <button onClick={() => setSignature(null)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="w-full lg:w-2/3 bg-slate-100 dark:bg-slate-900/50 rounded-xl p-8 overflow-auto flex justify-center items-start border border-slate-200 dark:border-slate-700">
          <div 
            ref={printRef}
            className="bg-white text-black shadow-2xl w-[210mm] h-[297mm] relative flex flex-col overflow-hidden shrink-0"
            style={{ fontFamily: "'Noto Serif Bengali', serif" }} 
          >
            {/* Content Container */}
            <div className="relative z-10 px-16 py-12 flex flex-col h-full">
                {/* Header Section with Logo */}
                <div className="flex justify-between items-center mb-8 border-b border-slate-300 pb-6">
                    {logo ? (
                        <img src={logo} alt="Company Logo" className="h-24 object-contain" />
                    ) : (
                        <div className="h-20 w-40 flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 rounded-lg bg-slate-50">
                            Logo Placeholder
                        </div>
                    )}
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-black mb-1">ক্লিপিং ফ্রেন্ড</h2>
                        <p className="text-slate-600 font-medium text-sm">মালুচী বাজার, শিবালয়, মানিকগঞ্জ</p>
                        <p className="text-slate-500 text-xs mt-1">www.clippingfriend.com</p>
                    </div>
                </div>

                {/* Reference and Date */}
                <div className="flex justify-between mb-10 text-base font-medium text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black">সূত্রঃ</span> 
                    <span className="min-w-[100px] inline-block text-black">{formData.sutra}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black">তারিখঃ</span> 
                    <span className="min-w-[100px] inline-block text-black">{formData.date}</span>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-10">
                  <h1 className="text-3xl font-bold text-black inline-block border-b-2 border-black uppercase tracking-wider pb-1">
                    প্রত্যয়ন পত্র
                  </h1>
                </div>

                {/* Body Content */}
                <div className="text-justify leading-[2.4] text-[17px] text-slate-900 space-y-6">
                  <p>
                    এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, নামঃ <span className="font-bold text-lg text-black">{formData.name || '_________________'}</span>, 
                    পিতাঃ <span className="font-bold text-lg text-black">{formData.fatherName || '___________'}</span>, 
                    মাতাঃ <span className="font-bold text-lg text-black">{formData.motherName || '____________'}</span>, 
                    তিনি অত্র প্রতিষ্ঠান <span className="font-bold text-black">"ক্লিপিং ফ্রেন্ড"</span>, মালুচী বাজার, শিবালয়, মানিকগঞ্জে একজন <span className="font-bold text-lg text-black">{formData.designation || '_________________'}</span> পদে কর্মরত আছেন। 
                    তিনি অত্র প্রতিষ্ঠানে নিয়মিত ও সুনামের সাথে দায়িত্ব পালন করে আসছেন এবং বর্তমানে তার মাসিক বেতন <span className="font-bold text-lg text-black">{formData.salary || '_________________'}</span> টাকা মাত্র। 
                    তার ব্যক্তিগত ও পেশাগত আচরন সন্তোষজনক। ভবিষ্যত জীবনে তার সার্বিক উন্নতি ও সাফল্য কামনা করছি।
                  </p>
                  <p className="mt-8 text-slate-600 italic border-l-4 border-slate-300 pl-4 py-2 bg-slate-50 rounded-r-lg text-base">
                    এই প্রত্যয়ন পত্রটি তার ব্যক্তিগত প্রয়োজনে প্রদান করা হলো।
                  </p>
                </div>

                {/* Signature Area */}
                <div className="mt-auto pt-10 flex justify-end">
                  <div className="w-64 flex flex-col items-center relative">
                    <div className="h-20 w-full flex items-end justify-center mb-2 relative">
                      {signature && (
                        <img src={signature} alt="Signature" className="max-h-20 max-w-full object-contain absolute bottom-0 z-10" />
                      )}
                    </div>
                    <div className="border-t-2 border-black w-full mb-2"></div>
                    <div className="text-center font-bold text-black text-lg uppercase tracking-wide">Managing Director</div>
                    <div className="text-center text-xs text-slate-500 font-medium">Clipping Friend</div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
