'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Vendor, Project } from '@/types'
import VendorModal from '@/components/modals/VendorModal'
import ProjectModal from '@/components/modals/ProjectModal'
import CSVImport from '@/components/admin/CSVImport'

interface TableData {
  vendors: Vendor[]
  projects: Project[]
}

export default function SimplifiedAdminPage() {
  const [data, setData] = useState<TableData>({ vendors: [], projects: [] })
  const [loading, setLoading] = useState(true)
  const [vendorModalOpen, setVendorModalOpen] = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return data;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return {
      vendors: data.vendors.filter(vendor =>
        vendor.vendor_name.toLowerCase().includes(lowercasedFilter)
      ),
      projects: data.projects.filter(project =>
        project.project_title.toLowerCase().includes(lowercasedFilter)
      ),
    };
  }, [searchTerm, data]);

  const loadData = async () => {
    setLoading(true)
    try {
      const [vendorsRes, projectsRes] = await Promise.all([
        fetch('/api/admin/table-data?table=vendors'),
        fetch('/api/admin/table-data?table=projects')
      ])

      const vendorsData = await vendorsRes.json()
      const projectsData = await projectsRes.json()

      setData({
        vendors: vendorsData.data || [],
        projects: projectsData.data || []
      })
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openVendorModal = async (vendor: Vendor | null) => {
    if (vendor) {
      setSelectedVendor(vendor);
      setVendorModalOpen(true);
    } else {
      const response = await fetch('/api/admin/get-next-vendor-code');
      const data = await response.json();
      setSelectedVendor({ vendor_code: data.nextVendorCode } as Vendor);
      setVendorModalOpen(true);
    }
  };

  const openProjectModal = (project: Project) => {
    setSelectedProject(project)
    setProjectModalOpen(true)
  }

  const handleVendorModalSave = async (updatedVendorData: Partial<Vendor>) => {
    if (!selectedVendor) return;

    try {
      if (selectedVendor.vendor_id) {
        // Update existing vendor
        const changes = Object.entries(updatedVendorData).filter(([key, value]) => {
          return value !== selectedVendor[key as keyof Vendor];
        });

        for (const [field, value] of changes) {
          await fetch('/api/admin/update-record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              table: 'vendors',
              id: selectedVendor.vendor_id,
              field,
              value: value || '',
            }),
          });
        }

        setData(prev => ({
          ...prev,
          vendors: prev.vendors.map(vendor =>
            vendor.vendor_id === selectedVendor.vendor_id
              ? { ...vendor, ...updatedVendorData }
              : vendor
          ),
        }));

      } else {
        // Create new vendor
        const response = await fetch('/api/admin/create-vendor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedVendorData),
        });
        const newVendor = await response.json();
        setData(prev => ({ ...prev, vendors: [...prev.vendors, newVendor] }));
      }

      setVendorModalOpen(false);
      setSelectedVendor(null);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed - please try again');
    }
  };

  const handleProjectModalSave = async (updatedProjectData: Partial<Project>) => {
    if (!selectedProject) return

    try {
      const changes = Object.entries(updatedProjectData).filter(([key, value]) => {
        return value !== selectedProject[key as keyof Project]
      })

      for (const [field, value] of changes) {
        const response = await fetch('/api/admin/update-record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'projects',
            id: selectedProject.project_id,
            field,
            value: value || ''
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to update ${field}`)
        }
      }

      setData(prev => ({
        ...prev,
        projects: prev.projects.map(project =>
          project.project_id === selectedProject.project_id
            ? { ...project, ...updatedProjectData }
            : project
        )
      }))

      setProjectModalOpen(false)
      setSelectedProject(null)
    } catch (error) {
      console.error('Modal save failed:', error)
      alert('Save failed - please try again')
    }
  }

  const handleProjectDelete = async (projectId: string) => {
    try {
      const response = await fetch('/api/admin/delete-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'projects',
          id: projectId,
        }),
      });

      if (response.ok) {
        setData(prev => ({
          ...prev,
          projects: prev.projects.filter(p => p.project_id !== projectId),
        }));
        setProjectModalOpen(false);
        setSelectedProject(null);
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed - please try again');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading admin data...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search vendors or projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={loadData}>Refresh Data</Button>
          <Button onClick={() => openVendorModal(null)}>Add New Vendor</Button>
        </div>
      </div>

      <div className="mb-6">
        <CSVImport />
      </div>

      <Tabs defaultValue="vendors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vendors">
            Vendors <Badge variant="secondary" className="ml-2">{filteredData.vendors.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="projects">
            Projects <Badge variant="secondary" className="ml-2">{filteredData.projects.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredData.vendors.map((vendor) => (
              <Card key={vendor.vendor_id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <span className="font-semibold">{vendor.vendor_name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openVendorModal(vendor)}
                  >
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredData.projects.map((project) => (
              <Card key={project.project_id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{project.project_title}</h3>
                    <p className="text-sm text-gray-500">{project.client_name} / {project.vendor_name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openProjectModal(project)}
                  >
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <VendorModal
        vendor={selectedVendor}
        isOpen={vendorModalOpen}
        onClose={() => setVendorModalOpen(false)}
        onSave={handleVendorModalSave}
      />

      <ProjectModal
        project={selectedProject}
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={handleProjectModalSave}
        onDelete={handleProjectDelete}
      />
    </div>
  )
}
