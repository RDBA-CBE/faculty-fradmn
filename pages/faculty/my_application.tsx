import { DataTable } from 'mantine-datatable'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../store/themeConfigSlice'
import TextInput from '@/components/FormFields/TextInput.component'
import TextArea from '@/components/FormFields/TextArea.component'
import CustomSelect from '@/components/FormFields/CustomSelect.component'
import CustomPhoneInput from '@/components/phoneInput'
import IconSearch from '@/components/Icon/IconSearch'
import IconPlus from '@/components/Icon/IconPlus'
import IconTrash from '@/components/Icon/IconTrash'
import IconEye from '@/components/Icon/IconEye'
import IconEyeOff from '@/components/Icon/IconEyeOff'
import IconLoader from '@/components/Icon/IconLoader'
import IconEdit from '@/components/Icon/IconEdit'
import Pagination from '@/components/pagination/pagination'
import { showDeleteAlert, useSetState } from '@/utils/function.utils'
import Modal from '@/components/modal/modal.component'
import { Models } from '@/imports/models.import'
import { Success, Failure } from '@/utils/function.utils'
import useDebounce from '@/hook/useDebounce'
import Swal from 'sweetalert2'
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react'
import CustomeDatePicker from '@/components/datePicker'

const Application = () => {
  const dispatch = useDispatch()
  const [state, setState] = useSetState({
    page: 1,
    pageSize: 10,
    recordsData: [],
    totalRecords: 0,
    search: '',
    statusFilter: null,
    showModal: false,
    loading: false,
    submitting: false,
    sortBy: '',
    sortOrder: 'asc',
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    position_applied: '',
    qualification: '',
    experience: '',
    cover_letter: '',
    errors: {},
    count: 0,
    applicationList: [],
    next: null,
    prev: null,
    editId: null
  })

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Reviewed', label: 'Reviewed' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Rejected', label: 'Rejected' }
  ]

  const debounceSearch = useDebounce(state.search, 500)

  useEffect(() => {
    dispatch(setPageTitle('Applications'))
  }, [dispatch])

  useEffect(() => {
    applicationList(1)
  }, [])

  useEffect(() => {
    applicationList(1)
  }, [debounceSearch, state.statusFilter, state.sortBy])

  const applicationList = async page => {
    try {
      setState({ loading: true })
      const body = bodyData()

      const res: any = await Models.application.list(page, body)
      console.log('✌️res --->', res)

      const tableData = res?.results?.map(item => ({
        applicant_name: item?.applicant_name,
        applicant_email: item?.applicant_email,
        applicant_phone: item?.applicant_phone,
        position_applied: item?.position_applied,
        qualification: item?.qualification,
        experience: item?.experience,
        status: item?.status,
        id: item?.id,
        applied_date: item?.applied_date
      }))
      setState({
        loading: false,
        page: page,
        count: res?.count,
        applicationList: tableData,
        next: res?.next,
        prev: res?.previous
      })
    } catch (error) {
      console.error('Error fetching applications:', error)
      setState({
        recordsData: [],
        totalRecords: 0,
        loading: false
      })
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
    applicationList(pageNumber)
  }

  const handleStatusChange = (selectedOption: any) => {
    setState({ statusFilter: selectedOption, page: 1 })
  }

  const handleCloseModal = () => {
    setState({
      showModal: false,
      applicant_name: '',
      applicant_email: '',
      applicant_phone: '',
      position_applied: '',
      qualification: '',
      experience: '',
      cover_letter: '',
      errors: {},
      editId: null
    })
  }

  const handleFormChange = (field: string, value: string) => {
    setState({
      [field]: value,
      errors: {
        ...state.errors,
        [field]: ''
      }
    })
  }

  const handleEdit = row => {
    setState({
      editId: row?.id,
      showModal: true,
      applicant_name: row?.applicant_name,
      applicant_email: row?.applicant_email,
      applicant_phone: row?.applicant_phone,
      position_applied: row?.position_applied,
      qualification: row?.qualification,
      experience: row?.experience
    })
  }

  const handleUpdateStatus = async (row: any, newStatus: string) => {
    try {
      const body = {
        status: newStatus
      }
      await Models.application.update(body, row?.id)
      Success(`Application ${newStatus.toLowerCase()} successfully!`)
      applicationList(state.page)
    } catch (error) {
      Failure('Failed to update status. Please try again.')
    }
  }

  const handleDelete = row => {
    showDeleteAlert(
      () => {
        deleteRecord(row)
      },
      () => {
        Swal.fire('Cancelled', 'Your Record is safe :)', 'info')
      },
      'Are you sure want to delete record?'
    )
  }

  const deleteRecord = async (id: number) => {
    try {
      await Models.application.delete(id)
      Success('Application deleted successfully!')
      applicationList(state.page)
    } catch (error) {
      Failure('Failed to delete application. Please try again.')
    }
  }

  const handleCreateSubmit = async () => {
    try {
      setState({ submitting: true })
      const body = {
        applicant_name: state.applicant_name,
        applicant_email: state.applicant_email,
        applicant_phone: state.applicant_phone,
        position_applied: state.position_applied,
        qualification: state.qualification,
        experience: state.experience,
        cover_letter: state.cover_letter,
        status: 'Pending'
      }

      if (state.editId) {
        await Models.application.update(body, state.editId)
        Success('Application updated successfully!')
      } else {
        await Models.application.create(body)
        Success('Application created successfully!')
      }

      applicationList(state.page)
      handleCloseModal()
    } catch (error: any) {
      if (error?.inner) {
        const errors: any = {}
        error?.inner?.forEach((err: any) => {
          errors[err?.path] = err.message
        })
        setState({ errors })
      } else {
        Failure('Failed to create application. Please try again.')
      }
    } finally {
      setState({ submitting: false })
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 dark:from-gray-900 dark:to-gray-800'>
      {/* Header Section */}
      <div className='mb-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-2'>
            <h1 className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent'>
              Application Management
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Manage and review job applications
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
            className='group relative inline-flex transform items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl'
          >
            <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100'></div>
            <IconPlus className='relative z-10 h-5 w-5' />
            <span className='relative z-10'>Add Application</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Total Applications
              </p>
              <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                {state.count || 0}
              </p>
            </div>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900'>
              <FileText className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            </div>
          </div>
        </div>

        <div className='group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Pending
              </p>
              <p className='text-3xl font-bold text-yellow-600 dark:text-yellow-400'>
                {state.applicationList?.filter(app => app.status === 'Pending')
                  ?.length || 0}
              </p>
            </div>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900'>
              <Clock className='h-6 w-6 text-yellow-600 dark:text-yellow-400' />
            </div>
          </div>
        </div>

        <div className='group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Accepted
              </p>
              <p className='text-3xl font-bold text-green-600 dark:text-green-400'>
                {state.applicationList?.filter(app => app.status === 'Accepted')
                  ?.length || 0}
              </p>
            </div>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900'>
              <CheckCircle className='h-6 w-6 text-green-600 dark:text-green-400' />
            </div>
          </div>
        </div>

        <div className='group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Rejected
              </p>
              <p className='text-3xl font-bold text-red-600 dark:text-red-400'>
                {state.applicationList?.filter(app => app.status === 'Rejected')
                  ?.length || 0}
              </p>
            </div>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900'>
              <XCircle className='h-6 w-6 text-red-600 dark:text-red-400' />
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
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='group relative'>
            <TextInput
              placeholder='Search applications...'
              value={state.search}
              onChange={e => setState({ search: e.target.value })}
              icon={<IconSearch className='h-4 w-4' />}
              className='transition-all duration-200 focus:shadow-lg group-hover:shadow-md'
            />
          </div>

          <CustomeDatePicker
            value={state.date}
            placeholder='Choose Date'
            onChange={e => setState({ date: e })}
            showTimeSelect={false}
          />
          <div className='group relative'>
            <CustomSelect
              options={statusOptions}
              value={state.statusFilter}
              onChange={handleStatusChange}
              placeholder='Filter by Status'
              isClearable={true}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800'>
        <div className='border-b border-gray-200 p-6 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
              Applications List
            </h3>
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              {state.count} applications found
            </div>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <DataTable
            noRecordsText='No applications found'
            highlightOnHover
            className='table-hover whitespace-nowrap'
            records={state.applicationList}
            fetching={state.loading}
            customLoader={
              <div className='flex items-center justify-center py-12'>
                <div className='flex items-center gap-3'>
                  <IconLoader className='h-6 w-6 animate-spin text-blue-600' />
                  <span className='text-gray-600 dark:text-gray-400'>
                    Loading applications...
                  </span>
                </div>
              </div>
            }
            columns={[
              {
                accessor: 'applicant_name',
                title: 'Applicant Name',
                sortable: true,
                render: ({ applicant_name }) => (
                  <div className='font-medium text-gray-900 dark:text-white'>
                    {applicant_name}
                  </div>
                )
              },
              {
                accessor: 'applicant_email',
                title: 'Email',
                sortable: true,
                render: ({ applicant_email }) => (
                  <span className='inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200'>
                    {applicant_email}
                  </span>
                )
              },
              {
                accessor: 'position_applied',
                title: 'Position',
                render: ({ position_applied }) => (
                  <div className='text-gray-600 dark:text-gray-400'>
                    {position_applied}
                  </div>
                ),
                sortable: true
              },
              {
                accessor: 'qualification',
                title: 'Qualification',
                render: ({ qualification }) => (
                  <div className='text-gray-600 dark:text-gray-400'>
                    {qualification}
                  </div>
                ),
                sortable: true
              },
              {
                accessor: 'status',
                title: 'Status',
                render: ({ status }) => (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : status === 'Reviewed'
                        ? 'bg-blue-100 text-blue-800'
                        : status === 'Accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {status}
                  </span>
                ),
                sortable: true
              },
              {
                accessor: 'actions',
                title: 'Actions',
                textAlignment: 'center',
                render: (row: any) => (
                  <div className='flex items-center justify-center gap-2'>
                    <button
                      onClick={() => handleEdit(row)}
                      className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-all duration-200 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-400'
                      title='Edit'
                    >
                      <IconEdit className='h-4 w-4' />
                    </button>
                    {row?.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(row, 'Accepted')}
                          className='flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-all duration-200 hover:bg-green-200 dark:bg-green-900 dark:text-green-400'
                          title='Accept'
                        >
                          <IconEye className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(row, 'Rejected')}
                          className='flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-all duration-200 hover:bg-red-200 dark:bg-red-900 dark:text-red-400'
                          title='Reject'
                        >
                          <IconEyeOff className='h-4 w-4' />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(row)}
                      className='flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-all duration-200 hover:bg-red-200 dark:bg-red-900 dark:text-red-400'
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
              applicationList(1)
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

      {/* Modal */}
      <Modal
        open={state.showModal}
        close={handleCloseModal}
        renderComponent={() => (
          <div className='relative'>
            {/* Header with gradient */}
            <div className='mb-8 text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900'>
                {state.editId ? (
                  <IconEdit className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                ) : (
                  <IconPlus className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                )}
              </div>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                {state.editId ? 'Update' : 'Add New'} Application
              </h2>
              <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                Fill in the details to create a new job application
              </p>
            </div>

            {/* Form with modern styling */}
            <div className='space-y-6'>
              {/* Row 1 */}
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                <div className='group'>
                  <TextInput
                    title='Applicant Name'
                    placeholder='Enter applicant name'
                    value={state.applicant_name}
                    onChange={e =>
                      handleFormChange('applicant_name', e.target.value)
                    }
                    error={state.errors.applicant_name}
                    className='transition-all duration-200 focus:shadow-lg group-hover:shadow-md'
                    required
                  />
                </div>
                <div className='group'>
                  <TextInput
                    title='Email Address'
                    type='email'
                    placeholder='applicant@example.com'
                    value={state.applicant_email}
                    onChange={e =>
                      handleFormChange('applicant_email', e.target.value)
                    }
                    error={state.errors.applicant_email}
                    className='transition-all duration-200 focus:shadow-lg group-hover:shadow-md'
                    required
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                <div className='group'>
                  <CustomPhoneInput
                    title='Phone Number'
                    value={state.applicant_phone}
                    onChange={value =>
                      handleFormChange('applicant_phone', value)
                    }
                    error={state.errors.applicant_phone}
                    required
                  />
                </div>
                <div className='group'>
                  <TextInput
                    title='Position Applied'
                    placeholder='Enter position'
                    value={state.position_applied}
                    onChange={e =>
                      handleFormChange('position_applied', e.target.value)
                    }
                    error={state.errors.position_applied}
                    className='transition-all duration-200 focus:shadow-lg group-hover:shadow-md'
                    required
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                <div className='group'>
                  <TextInput
                    title='Qualification'
                    placeholder='Enter qualification'
                    value={state.qualification}
                    onChange={e =>
                      handleFormChange('qualification', e.target.value)
                    }
                    error={state.errors.qualification}
                    className='transition-all duration-200 focus:shadow-lg group-hover:shadow-md'
                    required
                  />
                </div>
                <div className='group'>
                  <TextInput
                    title='Experience'
                    placeholder='Enter experience'
                    value={state.experience}
                    onChange={e =>
                      handleFormChange('experience', e.target.value)
                    }
                    error={state.errors.experience}
                    className='transition-all duration-200 focus:shadow-lg group-hover:shadow-md'
                    required
                  />
                </div>
              </div>

              {/* Cover Letter - Full width */}
              <div className='group'>
                <TextArea
                  title='Cover Letter'
                  placeholder='Enter cover letter'
                  value={state.cover_letter}
                  onChange={e =>
                    handleFormChange('cover_letter', e.target.value)
                  }
                  error={state.errors.cover_letter}
                  rows={4}
                  className='transition-all duration-200 focus:shadow-lg group-hover:shadow-md'
                />
              </div>
            </div>

            {/* Action buttons with modern styling */}
            <div className='mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-end'>
              <button
                type='button'
                onClick={handleCloseModal}
                className='inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                disabled={state.submitting}
                className={`group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  state.submitting ? 'cursor-not-allowed opacity-70' : ''
                }`}
              >
                <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100'></div>
                {state.submitting ? (
                  <IconLoader className='relative z-10 mr-2 h-4 w-4 animate-spin' />
                ) : state.editId ? (
                  <IconEdit className='relative z-10 mr-2 h-4 w-4' />
                ) : (
                  <IconPlus className='relative z-10 mr-2 h-4 w-4' />
                )}
                <span className='relative z-10'>
                  {state.submitting
                    ? 'Loading...'
                    : state.editId
                    ? 'Update Application'
                    : 'Create Application'}
                </span>
              </button>
            </div>
          </div>
        )}
      />
    </div>
  )
}

<<<<<<< HEAD
export default PrivateRouter(Application)
=======
export default Application
>>>>>>> 4bfe6f2999c06b9c8284ea62e27901014d5a7378
