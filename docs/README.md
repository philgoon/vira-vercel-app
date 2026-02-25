# ViRA Documentation

This folder contains all user-facing documentation for the ViRA application.

---

## Available Documentation

### Comprehensive Guide
- **[user-guide.md](./user-guide.md)** - Complete user guide with all features
  - Getting Started
  - Core Workflows (6 major use cases)
  - Role-specific features (Admin, Team, Vendors)
  - Tips, troubleshooting, and changelog
  - **Best for:** Reference, detailed feature explanations, training materials

### Quick Start Guides (One-Page)
These concise guides focus on the most important first-time tasks for each role.

- **[quick-start-admin.md](./quick-start-admin.md)** - Admin Quick Start
  - Import projects via CSV
  - Invite vendors to portal
  - Add team members
  - Monitor performance

- **[quick-start-team.md](./quick-start-team.md)** - Team Member Quick Start
  - Review projects (5-step wizard)
  - Get vendor recommendations
  - Research vendors

- **[quick-start-vendor.md](./quick-start-vendor.md)** - Vendor Quick Start
  - Complete application process
  - Update profile and availability
  - View performance ratings
  - Understand ViRA Score

**Best for:** Onboarding new users, quick reference, printing/PDF distribution

---

## Which Document Should I Use?

### For New Users:
1. **Start with Quick Start guide** for your role
2. **Reference user-guide.md** for detailed questions

### For Training:
1. **Use Quick Start guides** for initial onboarding session
2. **Use user-guide.md** for comprehensive training

### For Support:
1. **Check Troubleshooting section** in user-guide.md
2. **Reference Quick Start guides** for common tasks

### For Development:
- See **Technical Documentation** in parent directory
- `STATUS.md` - Implementation status and sprint history
- `CLAUDE.local.md` - WBS features and architecture

---

## Converting to PDF

To create PDF versions of Quick Start guides:

### Option 1: Using Pandoc (Recommended)
```bash
pandoc quick-start-admin.md -o quick-start-admin.pdf
pandoc quick-start-team.md -o quick-start-team.pdf
pandoc quick-start-vendor.md -o quick-start-vendor.pdf
```

### Option 2: Using Markdown Preview
1. Open file in VS Code or Markdown editor
2. Use "Print to PDF" feature
3. Adjust margins to fit content on one page

### Option 3: Using Online Tools
- [Markdown to PDF](https://www.markdowntopdf.com/)
- Upload markdown file
- Download PDF

---

## Version History

| Document | Version | Last Updated | Major Changes |
|----------|---------|--------------|---------------|
| user-guide.md | 2.0 | 2025-11-10 | Added Core Workflows section, updated all features since Sept 2025 |
| quick-start-admin.md | 1.0 | 2025-11-10 | Initial creation |
| quick-start-team.md | 1.0 | 2025-11-10 | Initial creation |
| quick-start-vendor.md | 1.0 | 2025-11-10 | Initial creation |

---

## Updating Documentation

When adding new features:

1. **Update user-guide.md**
   - Add to appropriate Core Workflow or role section
   - Update Feature Changelog
   - Update Last Updated date

2. **Update Quick Start guides** (if feature is essential)
   - Keep concise - only add if critical to first-time use
   - Maintain one-page length

3. **Update this README**
   - Add version history entry
   - Update major changes summary

---

## Distribution

### For New Admin Users:
Email both:
- quick-start-admin.pdf
- Link to full user-guide.md

### For New Team Members:
Email:
- quick-start-team.pdf
- Link to user-guide.md section "For Team Members"

### For New Vendors:
Include in approval email:
- quick-start-vendor.pdf
- Link to Vendor Portal
- Link to user-guide.md section "For Vendors"

---

## Support Resources

**For Technical Issues:**
- Contact: IT Support or System Administrator

**For Feature Questions:**
- Primary: user-guide.md
- Secondary: Quick Start guides
- Last resort: Contact ViRA project lead

**For Training Requests:**
- Use Quick Start guides for initial sessions
- Use user-guide.md for deep-dive training
- Schedule live walkthrough for complex workflows

---

## Documentation Metrics

**user-guide.md:**
- Total length: ~865 lines
- Core Workflows: 6 major use cases
- Features documented: 17+ (since Sept 2025)
- Roles covered: 3 (Admin, Team, Vendor)

**Quick Start Guides:**
- Target length: 1 page each (when printed)
- Focus: First-time essential tasks only
- Format: Checklist and step-by-step

---

**Maintained by:** ViRA Development Team
**Last Updated:** November 10, 2025
