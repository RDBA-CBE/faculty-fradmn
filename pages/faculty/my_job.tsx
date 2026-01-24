import { DataTable } from 'mantine-datatable'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../store/themeConfigSlice'
import TextInput from '@/components/FormFields/TextInput.component'
import TextArea from '@/components/FormFields/TextArea.component'
import CustomSelect from '@/components/FormFields/CustomSelect.component'
import IconSearch from '@/components/Icon/IconSearch'
import IconPlus from '@/components/Icon/IconPlus'
import IconTrash from '@/components/Icon/IconTrash'
import IconEye from '@/components/Icon/IconEye'
import IconEyeOff from '@/components/Icon/IconEyeOff'
import IconLoader from '@/components/Icon/IconLoader'
import IconEdit from '@/components/Icon/IconEdit'
import Pagination from '@/components/pagination/pagination'
import {
  capitalizeFLetter,
  Dropdown,
  showDeleteAlert,
  useSetState
} from '@/utils/function.utils'
import Modal from '@/components/modal/modal.component'
import { Success, Failure } from '@/utils/function.utils'
import useDebounce from '@/hook/useDebounce'
import Swal from 'sweetalert2'
import { Models } from '@/imports/models.import'
import CustomeDatePicker from '@/components/datePicker'
import { Briefcase, Users, Building2, AlertCircle } from 'lucide-react'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { ROLES } from '@/utils/constant.utils'

const Job = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const [state, setState] = useSetState({
    page: 1,
    pageSize: 10,
    search: '',
    statusFilter: null,
    showModal: false,
    loading: false,
    submitting: false,
    sortBy: '',
    sortOrder: 'asc',

    // Job data
    jobList: [],
    count: 0,
    next: null,
    prev: null,
    editId: null,

    // Form fields
    job_title: '',
    job_description: '',
    college: null,
    department: null,
    job_type: null,
    experience_required: '',
    qualification: '',
    salary_range: '',
    last_date: '',
    priority: null,

    // Dropdown data
    collegeList: [],
    collegeLoading: false,
    collegePage: 1,
    collegeNext: null,

    departmentList: [],
    departmentLoading: false,
    departmentPage: 1,
    departmentNext: null,

    errors: {}
  })

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  const jobTypeOptions = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ]

  const experienceOptions = [
    { value: '0-1 years', label: '0-1 years' },
    { value: '1-3 years', label: '1-3 years' },
    { value: '3-5 years', label: '3-5 years' },
    { value: '5-10 years', label: '5-10 years' },
    { value: '10+ years', label: '10+ years' }
  ]

  const debounceSearch = useDebounce(state.search, 500)

  useEffect(() => {
    dispatch(setPageTitle('Job Management'))
  }, [dispatch])

  useEffect(() => {
    jobList(1)
    collegeDropdownList(1)
    profile() // Initialize dropdown separately
  }, [])

  useEffect(() => {
    jobList(1)
  }, [debounceSearch, state.statusFilter, state.sortBy])

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile()
      setState({ profile: res })
    } catch (error) {
      console.error('Error fetching institutions:', error)
    }
  }

  const jobList = async page => {
    try {
      setState({ loading: true })

      const body = bodyData()
      const res: any = await Models.job.list(page, body)

      const tableData = res?.results?.map(item => ({
        id: item.id,
        job_title: item.job_title,
        job_description: item.job_description,

        college_name: item?.college?.name,
        department_name: item?.department?.name || '-',

        job_type: item?.job_type,
        experiences: item?.experiences,
        qualification: item?.qualification,
        salary_range: item?.salary_range,
        number_of_openings: item?.number_of_openings,

        last_date: item?.last_date,
        priority: item?.priority,
        job_status: item?.job_status,

        total_applications: item?.total_applications,

        college_id: item?.college?.id,
        department_id: item?.department?.id
      }))

      setState({
        loading: false,
        page,
        count: res?.count,
        jobList: tableData,
        next: res?.next,
        prev: res?.previous
      })
    } catch (error) {
      setState({ loading: false })
      Failure('Failed to fetch jobs')
    }
  }

  const collegeDropdownList = async (page, search = '', loadMore = false) => {
    try {
      setState({ collegeLoading: true })
      const body = { search }
      const res: any = await Models.college.list(page, body)
      const dropdown = Dropdown(res?.results, 'college_name')

      setState({
        collegeLoading: false,
        collegePage: page,
        collegeList: loadMore ? [...state.collegeList, ...dropdown] : dropdown,
        collegeNext: res?.next
      })
    } catch (error) {
      setState({ collegeLoading: false })
    }
  }

  const bodyData = () => {
    const body: any = {}
    if (state.search) {
      body.search = state.search
    }
    if (state.sortBy) {
      body.ordering =
        state.sortOrder === 'desc' ? `-${state.sortBy}` : state.sortBy
    }
    return body
  }

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber })
    jobList(pageNumber)
  }

  const handleStatusChange = (selectedOption: any) => {
    setState({ statusFilter: selectedOption, page: 1 })
  }

  const handleCloseModal = () => {
    setState({
      showModal: false,
      job_title: '',
      job_description: '',
      college: null,
      department: null,
      job_type: null,
      experience_required: '',
      qualification: '',
      salary_range: '',
      last_date: '',
      priority: null,
      departmentList: [],
      errors: {},
      editId: null
    })
  }

  const handleToggleStatus = async (row: any) => {
    try {
      const newStatus = row?.status === 'active' ? 'inactive' : 'active'
      await Models.job.update({ status: newStatus }, row?.id)
      Success(`Job ${newStatus} successfully!`)
      jobList(state.page)
    } catch (error) {
      Failure('Failed to update status')
    }
  }

  const handleDelete = row => {
    showDeleteAlert(
      () => deleteRecord(row?.id),
      () => Swal.fire('Cancelled', 'Record is safe', 'info'),
      'Are you sure you want to delete this job?'
    )
  }

  const deleteRecord = async (id: number) => {
    try {
      await Models.job.delete(id)
      Success('Job deleted successfully!')
      jobList(state.page)
    } catch (error) {
      Failure('Failed to delete job')
    }
  }

  const handleEdit = row => {
    console.log('✌️row --->', row)
    router.push(`/faculty/updatejob?id=${row.id}`)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 dark:from-gray-900 dark:to-gray-800'>
      {/* Header Section */}
      <div className='mb-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-2'>
            <h1 className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent'>
              Job Management
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Manage job postings and opportunities
            </p>
          </div>
          <button
            onClick={() => router.push('newjob')}
            className='group relative inline-flex transform items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl'
          >
            <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100'></div>
            <IconPlus className='relative z-10 h-5 w-5' />
            <span className='relative z-10'>Add Job</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Total Jobs
              </p>
              <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                {state.count || 0}
              </p>
            </div>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900'>
              <Briefcase className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            </div>
          </div>
        </div>

        <div className='group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Active Jobs
              </p>
              <p className='text-3xl font-bold text-green-600 dark:text-green-400'>
                {state.jobList?.filter(job => job.status === 'active')
                  ?.length || 0}
              </p>
            </div>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900'>
              <Users className='h-6 w-6 text-green-600 dark:text-green-400' />
            </div>
          </div>
        </div>

        <div className='group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Urgent Priority
              </p>
              <p className='text-3xl font-bold text-red-600 dark:text-red-400'>
                {state.jobList?.filter(job => job.priority === 'urgent')
                  ?.length || 0}
              </p>
            </div>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900'>
              <AlertCircle className='h-6 w-6 text-red-600 dark:text-red-400' />
            </div>
          </div>
        </div>

        <div className='group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Full Time
              </p>
              <p className='text-3xl font-bold text-purple-600 dark:text-purple-400'>
                {state.jobList?.filter(job => job.job_type === 'full_time')
                  ?.length || 0}
              </p>
            </div>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900'>
              <Building2 className='h-6 w-6 text-purple-600 dark:text-purple-400' />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className='mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800'>
        <div className='mb-4 flex items-center gap-2'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
            Filters
          </h3>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='group relative'>
            <TextInput
              placeholder='Search jobs...'
              value={state.search}
              onChange={e => setState({ search: e.target.value })}
              icon={<IconSearch className='h-4 w-4' />}
            />
          </div>
          <>
            {state.profile?.role == ROLES.SUPER_ADMIN && (
              <CustomSelect
                options={statusOptions}
                value={state.statusFilter}
                onChange={handleStatusChange}
                placeholder='Select institution'
                isClearable={true}
              />
            )}
            {(state.profile?.role == ROLES.SUPER_ADMIN ||
              state.profile?.role == ROLES.INSTITUTION_ADMIN) && (
              <CustomSelect
                options={statusOptions}
                value={state.statusFilter}
                onChange={handleStatusChange}
                placeholder='Select college'
                isClearable={true}
              />
            )}
            {state.profile?.role != ROLES.HOD && (
              <CustomSelect
                options={statusOptions}
                value={state.statusFilter}
                onChange={handleStatusChange}
                placeholder='Select department'
                isClearable={true}
              />
            )}
            <CustomSelect
              options={statusOptions}
              value={state.statusFilter}
              onChange={handleStatusChange}
              placeholder='Filter by status'
              isClearable={true}
            />

            <CustomSelect
              options={statusOptions}
              value={state.statusFilter}
              onChange={handleStatusChange}
              placeholder='Select experience'
              isClearable={true}
            />

            <CustomSelect
              options={statusOptions}
              value={state.statusFilter}
              onChange={handleStatusChange}
              placeholder='Select job type'
              isClearable={true}
            />
          </>
        </div>
      </div>

      {/* Table Section */}
      <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800'>
        <div className='border-b border-gray-200 p-6 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
              Jobs List
            </h3>
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              {state.count} jobs found
            </div>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <DataTable
            noRecordsText='No jobs found'
            highlightOnHover
            className='table-hover whitespace-nowrap'
            records={state.jobList}
            fetching={state.loading}
            customLoader={
              <div className='flex items-center justify-center py-12'>
                <div className='flex items-center gap-3'>
                  <IconLoader className='h-6 w-6 animate-spin text-blue-600' />
                  <span className='text-gray-600 dark:text-gray-400'>
                    Loading jobs...
                  </span>
                </div>
              </div>
            }
            columns={[
              {
                accessor: 'job_title',
                title: 'Job Title',
                sortable: true,
                render: ({ job_title }) => (
                  <div className='font-medium text-gray-900 dark:text-white'>
                    {job_title}
                  </div>
                )
              },
              {
                accessor: 'department_name',
                title: 'Dept',
                sortable: true,
                render: ({ department_name }) => (
                  <span className='text-gray-600 dark:text-gray-400'>
                    {department_name || '-'}
                  </span>
                )
              },
              {
                accessor: 'college_name',
                title: 'College',
                sortable: true,
                render: ({ college_name }) => (
                  <span className='text-gray-600 dark:text-gray-400'>
                    {college_name || '-'}
                  </span>
                )
              },

              {
                accessor: 'job_type',
                title: 'Type',
                render: ({ job_type }) => (
                  <span className='inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                    {job_type?.replace('_', ' ') || '-'}
                  </span>
                )
              },
              {
                accessor: 'experiences',
                title: 'Experience',
                render: ({ experiences }) => (
                  <span className='text-gray-600 dark:text-gray-400'>
                    {experiences || '-'}
                  </span>
                )
              },
              {
                accessor: 'number_of_openings',
                title: 'Openings',
                render: ({ number_of_openings }) => (
                  <span className='text-gray-600 dark:text-gray-400'>
                    {number_of_openings || '-'}
                  </span>
                )
              },
              {
                accessor: 'job_status',
                title: 'Status',
                render: ({ job_status }) => (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      job_status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : job_status === 'draft'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {capitalizeFLetter(job_status) || '-'}
                  </span>
                )
              },
              {
                accessor: 'priority',
                title: 'Priority',
                render: ({ priority }) => (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : priority === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {priority || 'N/A'}
                  </span>
                )
              },

              {
                accessor: 'total_applications',
                title: 'Applications',
                sortable: true,
                render: ({ total_applications }) => (
                  <span className='text-gray-600 dark:text-gray-400'>
                    {total_applications}
                  </span>
                )
              },

              {
                accessor: 'last_date',
                title: 'Last Date',
                render: ({ last_date }) => (
                  <span className='text-gray-600 dark:text-gray-400'>
                    {last_date ? new Date(last_date).toLocaleDateString() : '-'}
                  </span>
                )
              },
              {
                accessor: 'actions',
                title: 'Actions',
                render: (row: any) => (
                  <div className='flex items-center justify-center gap-2'>
                    <button
                      onClick={() => handleEdit(row)}
                      className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200'
                      title='Edit'
                    >
                      <IconEdit className='h-4 w-4' />
                    </button>

                    <button
                      onClick={() => handleToggleStatus(row)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        row?.job_status === 'published'
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={
                        row?.job_status === 'published'
                          ? 'Unpublish'
                          : 'Publish'
                      }
                    >
                      {row?.job_status === 'published' ? (
                        <IconEyeOff className='h-4 w-4' />
                      ) : (
                        <IconEye className='h-4 w-4' />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(row)}
                      className='flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200'
                      title='Delete'
                    >
                      <IconTrash className='h-4 w-4' />
                    </button>
                  </div>
                )
              }
            ]}
            sortStatus={{
              columnAccessor: state.sortBy,
              direction: state.sortOrder as 'asc' | 'desc'
            }}
            onSortStatusChange={({ columnAccessor, direction }) => {
              setState({
                sortBy: columnAccessor,
                sortOrder: direction,
                page: 1
              })
              jobList(1)
            }}
            minHeight={200}
          />
        </div>

        <div className='border-t border-gray-200 p-6 dark:border-gray-700'>
          <Pagination
            activeNumber={handlePageChange}
            totalPage={state.count}
            currentPages={state.page}
            pageSize={state.pageSize}
          />
        </div>
      </div>
    </div>
  )
}

export default Job
