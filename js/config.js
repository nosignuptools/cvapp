const DEFAULT_HTML = `
<div class="resume-layout">
    <div class="resume-sidebar bg-dynamic sortable-list" id="area-sidebar">
        <p class="text-white/40 text-xs text-center py-8">Add content from sidebar</p>
    </div>
    <div class="resume-main sortable-list" id="area-body">
        <p class="text-gray-400 text-sm text-center py-16">Start building your CV</p>
    </div>
</div>`;

const contactIcons = {
  email: {
    icon: "fa-solid fa-envelope",
    placeholder: "your@email.com",
  },
  phone: {
    icon: "fa-solid fa-phone",
    placeholder: "+1 234 567 890",
  },
  location: {
    icon: "fa-solid fa-location-dot",
    placeholder: "City, Country",
  },
  linkedin: {
    icon: "fa-brands fa-linkedin",
    placeholder: "linkedin.com/in/yourprofile",
  },
  github: {
    icon: "fa-brands fa-github",
    placeholder: "github.com/username",
  },
  website: {
    icon: "fa-solid fa-globe",
    placeholder: "yourwebsite.com",
  },
  twitter: {
    icon: "fa-brands fa-twitter",
    placeholder: "@handle",
  },
  portfolio: {
    icon: "fa-solid fa-briefcase",
    placeholder: "portfolio.com",
  },
};

const controlsHtml = `
<div class="block-controls">
    <div class="control-btn" onclick="moveBlock(this, 'up')"><i class="fa-solid fa-arrow-up"></i></div>
    <div class="control-btn" onclick="moveBlock(this, 'down')"><i class="fa-solid fa-arrow-down"></i></div>
    <div class="control-btn btn-del" onclick="removeBlock(this)"><i class="fa-solid fa-times"></i></div>
</div>`;

const sectionTemplates = {
  photo: `
    <div class="resume-block profile-pic-container" draggable="true" style="margin: 0 auto 14px; width: fit-content; padding: 4px;">
        ${controlsHtml}
        <div class="profile-pic cursor-pointer" onclick="this.querySelector('input').click()">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath fill-rule='evenodd' d='M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z' clip-rule='evenodd'/%3E%3C/svg%3E" alt="Photo">
            <div class="photo-overlay"><i class="fa-solid fa-camera"></i></div>
            <input type="file" class="hidden" accept="image/*" onchange="loadPhoto(event)">
        </div>
    </div>`,
  name: `
    <div class="resume-block name-section" draggable="true" style="padding: 4px; margin-bottom: 6px;">
        ${controlsHtml}
        <h1 contenteditable="true" placeholder="Your Name"></h1>
    </div>`,
  title: `
    <div class="resume-block" draggable="true" style="padding: 4px; margin-bottom: 16px; text-align: center;">
        ${controlsHtml}
        <h2 style="font-size: 13px; font-weight: 400; color: rgba(255,255,255,0.8);" contenteditable="true" placeholder="Professional Title"></h2>
    </div>`,
  summary: `
    <div class="resume-block" draggable="true">
        ${controlsHtml}
        <h3 class="section-header" contenteditable="true">Profile</h3>
        <p class="text-sm text-gray-600 leading-relaxed" contenteditable="true" placeholder="Write a brief professional summary..."></p>
    </div>`,
  experience: `
    <div class="resume-block group" draggable="true">
        ${controlsHtml}
        <div class="flex justify-between items-center mb-2">
            <h3 class="section-header" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;" contenteditable="true">Experience</h3>
            <button onclick="addJobItem(this)" class="sub-adder"><i class="fa-solid fa-plus"></i> Add</button>
        </div>
        <div class="border-b-2 mb-3" style="border-color: var(--accent-color);"></div>
        <div class="jobs-container sortable-list">
            <div class="job-item resume-block" style="margin: 0 -6px 12px; padding: 6px;">
                ${controlsHtml}
                <div class="flex justify-between items-start mb-1 flex-wrap gap-1">
                    <h4 class="font-semibold text-gray-800 text-sm" contenteditable="true" placeholder="Job Title"></h4>
                    <span class="text-[10px] text-gray-500 font-medium" contenteditable="true" placeholder="Date - Date"></span>
                </div>
                <div class="flex justify-between items-start mb-2">
                    <div class="text-xs text-accent font-medium" contenteditable="true" placeholder="Company Name"></div>
                    <div class="text-[10px] text-gray-500 font-medium" contenteditable="true" placeholder="City, Country"></div>
                </div>
                <ul class="list-disc list-outside ml-4 text-xs text-gray-600 space-y-1" contenteditable="true">
                    <li placeholder="Responsibilities..."></li>
                </ul>
            </div>
        </div>
    </div>`,
  volunteering: `
    <div class="resume-block group" draggable="true">
        ${controlsHtml}
        <div class="flex justify-between items-center mb-2">
            <h3 class="section-header" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;" contenteditable="true">Volunteering</h3>
            <button onclick="addJobItem(this)" class="sub-adder"><i class="fa-solid fa-plus"></i> Add</button>
        </div>
        <div class="border-b-2 mb-3" style="border-color: var(--accent-color);"></div>
        <div class="jobs-container sortable-list">
            <div class="job-item resume-block" style="margin: 0 -6px 12px; padding: 6px;">
                ${controlsHtml}
                <div class="flex justify-between items-start mb-1 flex-wrap gap-1">
                    <h4 class="font-semibold text-gray-800 text-sm" contenteditable="true" placeholder="Role / Title"></h4>
                    <span class="text-[10px] text-gray-500 font-medium" contenteditable="true" placeholder="Date - Date"></span>
                </div>
                <div class="text-xs text-accent font-medium mb-2" contenteditable="true" placeholder="Organization"></div>
                <ul class="list-disc list-outside ml-4 text-xs text-gray-600 space-y-1" contenteditable="true">
                    <li placeholder="Description of activities..."></li>
                </ul>
            </div>
        </div>
    </div>`,
  education: `
    <div class="resume-block group" draggable="true">
        ${controlsHtml}
        <div class="flex justify-between items-center mb-2">
            <h3 class="section-header" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;" contenteditable="true">Education</h3>
            <button onclick="addEduItem(this)" class="sub-adder"><i class="fa-solid fa-plus"></i> Add</button>
        </div>
        <div class="border-b-2 mb-3" style="border-color: var(--accent-color);"></div>
        <div class="edu-container sortable-list">
            <div class="edu-item resume-block" style="margin: 0 -6px 12px; padding: 6px;">
                ${controlsHtml}
                <div class="flex justify-between items-start mb-1 flex-wrap gap-1">
                    <h4 class="font-semibold text-gray-800 text-sm" contenteditable="true" placeholder="Degree"></h4>
                    <span class="text-[10px] text-gray-500 font-medium" contenteditable="true" placeholder="Year"></span>
                </div>
                <div class="flex justify-between items-start mb-1">
                    <div class="text-xs text-gray-600" contenteditable="true" placeholder="School Name"></div>
                    <div class="text-[10px] text-gray-500 font-medium" contenteditable="true" placeholder="City, Country"></div>
                </div>
                <ul class="list-disc list-outside ml-4 text-xs text-gray-500 space-y-1" contenteditable="true">
                    <li placeholder="GPA / Honors / Notes (optional)"></li>
                </ul>
            </div>
        </div>
    </div>`,
  skills: `
    <div class="resume-block" draggable="true" style="padding: 4px; margin-bottom: 16px;">
        ${controlsHtml}
        <h3 class="sidebar-section-header" contenteditable="true">Skills</h3>
        <ul class="smart-list" contenteditable="true">
            <li placeholder="Your skills..."></li>
        </ul>
    </div>`,
  languages: `
    <div class="resume-block" draggable="true" style="padding: 4px; margin-bottom: 16px;">
        ${controlsHtml}
        <h3 class="sidebar-section-header" contenteditable="true">Languages</h3>
        <ul class="smart-list" contenteditable="true">
            <li placeholder="Language - Level"></li>
        </ul>
    </div>`,
  interests: `
    <div class="resume-block" draggable="true" style="padding: 4px; margin-bottom: 16px;">
        ${controlsHtml}
        <h3 class="sidebar-section-header" contenteditable="true">Interests</h3>
        <ul class="smart-list" contenteditable="true">
            <li placeholder="Your interests..."></li>
        </ul>
    </div>`,
  awards: `
    <div class="resume-block" draggable="true" style="padding: 4px; margin-bottom: 16px;">
        ${controlsHtml}
        <h3 class="sidebar-section-header" contenteditable="true">Awards</h3>
        <ul class="smart-list" contenteditable="true">
            <li placeholder="Award Name - Year"></li>
        </ul>
    </div>`,
  certifications: `
    <div class="resume-block" draggable="true">
        ${controlsHtml}
        <h3 class="section-header" contenteditable="true">Certifications</h3>
        <ul class="list-disc list-outside ml-4 text-xs text-gray-600 space-y-1" contenteditable="true">
            <li placeholder="Certification - Year"></li>
        </ul>
    </div>`,
  projects: `
    <div class="resume-block group" draggable="true">
        ${controlsHtml}
        <div class="flex justify-between items-center mb-2">
            <h3 class="section-header" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;" contenteditable="true">Projects</h3>
            <button onclick="addProjectItem(this)" class="sub-adder"><i class="fa-solid fa-plus"></i> Add</button>
        </div>
        <div class="border-b-2 mb-3" style="border-color: var(--accent-color);"></div>
        <div class="projects-container sortable-list">
            <div class="project-item resume-block" style="margin: 0 -6px 12px; padding: 6px;">
                ${controlsHtml}
                <h4 class="font-semibold text-gray-800 text-sm" contenteditable="true" placeholder="Project Name"></h4>
                <p class="text-xs text-gray-600" contenteditable="true" placeholder="Project description..."></p>
            </div>
        </div>
    </div>`,
  references: `
    <div class="resume-block" draggable="true">
        ${controlsHtml}
        <h3 class="section-header" contenteditable="true">References</h3>
        <div class="grid grid-cols-2 gap-4">
            <div class="text-xs">
                <div class="font-bold" contenteditable="true" placeholder="Referee Name"></div>
                <div class="text-gray-600" contenteditable="true" placeholder="Job Title, Company"></div>
                <div class="text-gray-500" contenteditable="true" placeholder="Email / Phone"></div>
            </div>
            <div class="text-xs">
                <div class="font-bold" contenteditable="true" placeholder="Referee Name"></div>
                <div class="text-gray-600" contenteditable="true" placeholder="Job Title, Company"></div>
                <div class="text-gray-500" contenteditable="true" placeholder="Email / Phone"></div>
            </div>
        </div>
    </div>`,
};
