import { DataTable } from 'mantine-datatable'
import { useEffect, useState } from 'react'
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
import { GraduationCap, BookOpen } from 'lucide-react'
import Pagination from '@/components/pagination/pagination'
import { Dropdown, showDeleteAlert, useSetState } from '@/utils/function.utils'
import Modal from '@/components/modal/modal.component'
import { Success, Failure } from '@/utils/function.utils'
import useDebounce from '@/hook/useDebounce'
import Swal from 'sweetalert2'
import Models from '@/imports/models.import'
import { CreateCollege, CreateDepartment } from '@/utils/validation.utils'
import PrivateRouter from '@/hook/privateRouter'
import IconEdit from '@/components/Icon/IconEdit'
import { ROLES } from '@/utils/constant.utils'

const CollegeAndDepartment = () => {
  const dispatch = useDispatch()
  const [state, setState] = useSetState({
    // Wizard state
    currentStep: 1,
    completedSteps: [],
    createdCollegeId: null,
    createdDepartmentId: null,

    // Selection state
    selectedRecords: [],

    activeTab: 'colleges',
    page: 1,
    pageSize: 10,
    search: '',
    statusFilter: null,
    collegeFilter: null,
    showModal: false,
    showEditModal: false,
    loading: false,
    submitting: false,
    sortBy: '',
    sortOrder: 'asc',

    // College filter data
    collegeFilterOptions: [],
    collegeFilterLoading: false,
    collegeFilterPage: 1,
    collegeFilterNext: null,

    // College data
    collegeList: [],
    collegeCount: 0,
    college_name: '',
    college_code: '',
    college_email: '',
    college_phone: '',
    college_address: '',
    institution: null,

    // Department data
    departmentList: [],
    departmentCount: 0,
    department_name: '',
    department_code: '',
    department_email: '',
    department_phone: '',
    department_head: '',
    college: null,
    collegeDropdownList: [],
    collegeLoading: false,
    collegePage: 1,
    collegeNext: null,

    errors: {},
    editId: null
  })

  const steps = [
    { id: 1, name: 'College', icon: GraduationCap, required: true },
    { id: 2, name: 'Department', icon: BookOpen, required: true }
  ]

  const isStepCompleted = (stepId: number) =>
    state.completedSteps.includes(stepId)
  const isStepAccessible = (stepId: number) =>
    stepId === 1 || isStepCompleted(stepId - 1)

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  const debounceSearch = useDebounce(state.search, 500)

  useEffect(() => {
    dispatch(setPageTitle('Colleges & Departments'))
    institutionList(1)
    profile()
  }, [dispatch])

  useEffect(() => {
    if (state.activeTab === 'colleges') {
      collegeList(1)
    } else {
      deptList(1)
      loadCollegeFilterOptions(1) // Load colleges for filter dropdown
    }
  }, [state.activeTab])

  useEffect(() => {
    if (state.activeTab === 'colleges') {
      collegeList(1)
    } else {
      deptList(1)
    }
  }, [debounceSearch, state.statusFilter, state.collegeFilter, state.sortBy])

  const profile = async (isTabChange = true) => {
    try {
      const res: any = await Models.auth.profile()
      console.log('profile --->', res)
      setState({ profile: res,profile_institution: res?.institution })
      if(res?.institution){
      
        collegeDropdownList(1,"",false,res?.institution)

      }
    } catch (error) {
      console.error('Error fetching institutions:', error)
    }
  }

  const institutionList = async (page, search = '', loadMore = false) => {
    try {
      setState({ institutionLoading: true })
      const body = { search }
      console.log('✌️body --->', body)

      const res: any = await Models.institution.list(page, body)
      console.log('institutionList --->', res)

      const dropdown = Dropdown(res?.results, 'institution_name')
      console.log('✌️dropdown --->', dropdown)

      setState({
        institutionLoading: false,
        institutionPage: page,
        institutionList: loadMore
          ? [...state.institutionList, ...dropdown]
          : dropdown,
        institutionNext: res?.next,
        institutionPrev: res?.previous
      })
    } catch (error) {
      console.error('Error fetching institutions:', error)
      setState({ institutionLoading: false })
    }
  }

  const collegeDropdownList = async (
    page,
    search = '',
    loadMore = false,
    seletedInstitution = null
  ) => {
    try {
      setState({ collegeLoading: true })
      const body: any = { search }
      if (seletedInstitution) {
        body.institution = seletedInstitution?.institution_id
      }

      const res: any = await Models.college.list(page, body)
      const dropdown = Dropdown(res?.results, 'college_name')

      setState({
        collegeLoading: false,
        collegePage: page,
        collegeDropdownList: loadMore
          ? [...state.collegeDropdownList, ...dropdown]
          : dropdown,
        collegeNext: res?.next
      })
    } catch (error) {
      console.error('Error fetching colleges:', error)
      setState({ collegeLoading: false })
    }
  }

  const institutionDropdownList = async (
    page,
    search = '',
    loadMore = false
  ) => {
    try {
      setState({ institutionLoading: true })
      const body = { search }

      const res: any = await Models.institution.list(page, body)
      const dropdown = Dropdown(res?.results, 'institution_name')

      setState({
        institutionLoading: false,
        institutionPage: page,
        institutionDropdownList: loadMore
          ? [...state.institutionDropdownList, ...dropdown]
          : dropdown,
        institutionNext: res?.next
      })
    } catch (error) {
      console.error('Error fetching institutions:', error)
      setState({ institutionLoading: false })
    }
  }

  const collegeList = async (page, institutionId = null) => {
console.log('✌️institutionId --->', institutionId);
    try {
      setState({ loading: true })
      const body = collegeBodyData()
      if (institutionId) {
        body.institution = institutionId?.value
      }

      const res: any = await Models.college.list(page, body)
      const dropdown = Dropdown(res?.results, 'college_name')

      const tableData = res?.results?.map(item => ({
        id: item?.id,
        college_name: item?.college_name,
        college_code: item?.college_code,
        college_email: item?.college_email,
        college_phone: item?.college_phone,
        status: item?.status,
        institution_name: item?.institution_name,
        institution_id: item?.institution,
        total_departments: item?.total_departments,
        total_jobs: item?.total_jobs,
        college_address: item?.college_address
      }))

      setState({
        loading: false,
        collegeList: tableData,
        collegeCount: res.count,
        CollegeNext: res?.next,
        collegePrev: res?.prev,
      })
    } catch (error) {
      setState({ loading: false })
    }
  }

  const deptList = async page => {
    try {
      setState({ loading: true })
      const body = collegeBodyData()
      if (state.collegeFilter) {
        body.college = state.collegeFilter?.value
      }
      const res: any = await Models.department.list(page, body)
      console.log('deptList --->', res)

      const tableData = res?.results?.map(item => ({
        id: item?.id,
        department_name: item?.department_name,
        department_code: item?.department_code,
        department_email: item?.department_email,
        department_phone: item?.department_phone,
        status: item?.status,
        college_name: item?.college_name,
        college_id: item?.college,
        total_jobs: item?.total_jobs,
        institution_name: item?.college_name,
        institution_id: item?.college
      }))

      setState({
        loading: false,
        departmentNext: res?.next,
        departmentPrev: res?.prev,
        departmentCount: res?.count,
        deptList: tableData
      })
    } catch (error) {
      setState({ loading: false })
      Failure('Failed to fetch departments')
    }
  }

  const handleTabChange = tab => {
    setState({ activeTab: tab, page: 1, search: '', statusFilter: null, collegeFilter: null })
  }

  const handlePageChange = pageNumber => {
    setState({ page: pageNumber })
    collegeList(pageNumber)
  }

  const handleStatusChange = selectedOption => {
    setState({ statusFilter: selectedOption, page: 1 })
  }

  // College filter handlers
  const loadCollegeFilterOptions = async (page, search = '', loadMore = false) => {
    try {
      setState({ collegeFilterLoading: true })
      const body: any = { search }
      if (state.profile_institution) {
        body.institution = state.profile_institution.institution_id
      }
      const res: any = await Models.college.list(page, body)
      const dropdown = Dropdown(res?.results, 'college_name')
      
      setState({
        collegeFilterLoading: false,
        collegeFilterPage: page,
        collegeFilterOptions: loadMore
          ? [...state.collegeFilterOptions, ...dropdown]
          : dropdown,
        collegeFilterNext: res?.next,
      })
    } catch (error) {
      console.error('Error loading college filter options:', error)
      setState({ collegeFilterLoading: false })
    }
  }

  const handleCollegeFilterChange = selectedOption => {
    setState({ collegeFilter: selectedOption, page: 1 })
  }

  const handleCollegeFilterSearch = searchTerm => {
    loadCollegeFilterOptions(1, searchTerm)
  }

  const handleLoadMoreColleges = () => {
    if (state.collegeFilterNext) {
      loadCollegeFilterOptions(state.collegeFilterPage + 1, '', true)
    }
  }

  const handleSortStatusChange = ({ columnAccessor, direction }) => {
    console.log('Sort:', columnAccessor, direction)
    setState({
      sortBy: columnAccessor,
      sortOrder: direction === 'desc' ? 'desc' : 'asc'
    })
  }

  const handleCloseModal = () => {
    setState({
      showModal: false,
      showEditModal: false,
      currentStep: 1,
      completedSteps: [],
      createdCollegeId: null,
      createdDepartmentId: null,
      college_name: '',
      college_code: '',
      college_email: '',
      college_phone: '',
      college_address: '',
      institution: null,
      department_name: '',
      department_code: '',
      department_email: '',
      department_phone: '',
      department_head: '',
      college: null,
      errors: {},
      editId: null
    })
  }

  const handleFormChange = (field, value) => {
    setState({
      [field]: value,
      errors: {
        ...state.errors,
        [field]: ''
      }
    })
  }

  const collegeBodyData = () => {
    const body: any = {}
    const userId = localStorage.getItem("userId");

    if (state.search) {
      body.search = state.search
    }
    body.team = "No";

    if (userId) {
      body.created_by = userId;
    }
    if (state.sortBy) {
      body.ordering =
        state.sortOrder === 'desc' ? `-${state.sortBy}` : state.sortBy
      console.log('Ordering:', body.ordering)
    }

    return body
  }

  const handleEdit = row => {
    console.log('✌️row --->', row)
    if (state.activeTab === 'colleges') {
      setState({
        editId: row.id,
        showModal: false,
        college_name: row.college_name,
        college_code: row.college_code,
        college_email: row.college_email,
        college_phone: row.college_phone,
        college_address: row.college_address || '',
        institution: {
          value: row?.institution_id,
          label: row.institution_name
        },
        showEditModal: true
      })
    } else {
      setState({
        editId: row.id,
        showModal: true,
        department_name: row.department_name,
        department_code: row.department_code,
        institution: {
          value: row?.institution_id,
          label: row.institution_name
        },
        college: {
          value: row?.college_id,
          label: row.college_name
        }
      })
    }
  }

  const handleToggleStatus = async row => {
    try {
      const newStatus = row.status === 'active' ? 'inactive' : 'active'
      if (state.activeTab === 'colleges') {
        await Models.college.update({ status: newStatus }, row.id)
        Success(`College ${newStatus} successfully!`)

        collegeList(state.page)
      } else {
        await Models.department.update({ status: newStatus }, row.id)
        Success(`Department ${newStatus} successfully!`)

        deptList(state.page)
      }
    } catch (error) {
      Failure('Failed to update status')
    }
  }

  const handleDelete = row => {
    showDeleteAlert(
      () => deleteRecord(row.id),
      () => Swal.fire('Cancelled', 'Record is safe', 'info'),
      'Are you sure you want to delete this record?'
    )
  }

  const handleBulkDelete = () => {
    showDeleteAlert(
      () => {
        bulkDeleteRecords()
      },
      () => {
        Swal.fire('Cancelled', 'Your Records are safe :)', 'info')
      },
      `Are you sure want to delete ${state.selectedRecords.length} record(s)?`
    )
  }

  const deleteRecord = async id => {
    try {
      if (state.activeTab === 'colleges') {
        await Models.college.delete(id)
        Success('College deleted successfully!')
        collegeList(state.page)
      } else {
        await Models.department.delete(id)
        Success('Department deleted successfully!')
        deptList(state.page)
      }
    } catch (error) {
      Failure(
        `Failed to delete ${state.activeTab.slice(0, -1)}. Please try again.`
      )
    }
  }

  const bulkDeleteRecords = async () => {
    try {
      for (const id of state.selectedRecords) {
        if (state.activeTab === 'colleges') {
          await Models.college.delete(id)
        } else {
          await Models.department.delete(id)
        }
      }
      Success(
        `${state.selectedRecords.length} ${state.activeTab} deleted successfully!`
      )
      setState({ selectedRecords: [] })
      if (state.activeTab === 'colleges') {
        collegeList(state.page)
      } else {
        deptList(state.page)
      }
    } catch (error) {
      Failure(`Failed to delete ${state.activeTab}. Please try again.`)
    }
  }

  const rollbackCreatedRecords = async (records: any) => {
    console.log('Starting rollback for records:', records)
    try {
      if (records.departmentId) {
        console.log('Rolling back Department:', records.departmentId)
        await Models.department.delete(records.departmentId)
        console.log('Successfully deleted Department:', records.departmentId)
      }
      if (records.collegeId) {
        console.log('Rolling back College:', records.collegeId)
        await Models.college.delete(records.collegeId)
        console.log('Successfully deleted College:', records.collegeId)
      }
      console.log('Rollback completed successfully')
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError)
      Failure(
        'Failed to cleanup created records. Please contact administrator.'
      )
    }
  }

  const handleFinalSubmit = async () => {
    try {
      setState({ submitting: true })

      if (state.currentStep === 1) {
        // Step 1: Create College only
        const collegeBody = {
          college_name: state.college_name,
          college_code: state.college_code,
          college_email: state.college_email,
          college_phone: state.college_phone,
          college_address: state.college_address,
          institution: state?.profile_institution
        }

        try {
          await CreateCollege.validate(collegeBody, { abortEarly: false })
        } catch (validationError: any) {
          const errors = {}
          validationError.inner.forEach((error: any) => {
            errors[error.path] = error.message
          })
          setState({ errors })
          return
        }

        const collegeRes = await Models.college.create(collegeBody)
        Success('College created successfully!')
        handleCloseModal()
        collegeList(state.page)
      } else if (state.currentStep === 2) {
        // Step 2: Create College and Department (Final Step)
        const collegeBody = {
          college_name: state.college_name,
          college_code: state.college_code,
          college_email: state.college_email,
          college_phone: state.college_phone,
          college_address: state.college_address,
          institution: state?.profile_institution
        }

        try {
          await CreateCollege.validate(collegeBody, { abortEarly: false })
        } catch (validationError: any) {
          const errors = {}
          validationError.inner.forEach((error: any) => {
            errors[error.path] = error.message
          })
          setState({ errors })
          return
        }

        if (!state.department_name || !state.department_code) {
          setState({
            errors: {
              department_name: 'Department name is required',
              department_code: 'Department code is required'
            }
          })
          return
        }

        let createdRecords = { collegeId: null, departmentId: null }

        try {
          console.log('Step 2.1: Creating college...', collegeBody)
          const collegeRes: any = await Models.college.create(collegeBody)
          createdRecords.collegeId = collegeRes?.id
          console.log(
            'Step 2.1: College created successfully with ID:',
            createdRecords.collegeId
          )

          const deptBody = {
            department_name: state.department_name,
            department_code: state.department_code,
            college: createdRecords.collegeId,
            institution: state?.profile_institution
          }

          console.log('Step 2.2: Creating department...', deptBody)
          const deptRes: any = await Models.department.create(deptBody)
          createdRecords.departmentId = deptRes?.id
          console.log(
            'Step 2.2: Department created successfully with ID:',
            createdRecords.departmentId
          )

          Success('College and Department created successfully!')
          handleCloseModal()
          collegeList(state.page)
        } catch (error) {
          console.error('Step 2 Error Details:', error)
          await rollbackCreatedRecords(createdRecords)
          Failure('Operation failed. Please try again.')
        }
      }
    } catch (error: any) {
      console.log('✌️error --->', error)
      Failure('Operation failed. Please try again.')
    } finally {
      setState({ submitting: false })
    }
  }

  const handleSubmit = async () => {
    try {
      setState({ submitting: true })

      // If activeTab is departments, show single step department form
      if (state.activeTab === 'departments') {
        const body: any = {
          department_name: state.department_name,
          department_code: state.department_code,
          college: state.college?.value
        }

        // Validate all department fields at once
        const validationBody = {
          college: state.college?.value,
          department_name: state.department_name,
          department_code: state.department_code
        }

        const errors: any = {}

        // Check all required fields
        if (!validationBody.college) {
          errors.college = 'Please select a college'
        }
        if (!validationBody.department_name) {
          errors.department_name = 'Department name is required'
        }
        if (!validationBody.department_code) {
          errors.department_code = 'Department code is required'
        }

        // If any validation errors, show all at once
        if (Object.keys(errors).length > 0) {
          setState({ errors })
          return
        }

        // Clear errors if validation passes
        setState({ errors: {} })

        if (state.college?.value) {
          const res: any = await Models.college.details(state.college?.value)
          body.institution = res?.institution
        }

        console.log('✌️department body --->', body)

        if (state.editId) {
          const res = await Models.department.update(body, state.editId)
          Success('Department updated successfully!')
        } else {
          const res = await Models.department.create(body)
          Success('Department created successfully!')
        }

        deptList(state.page)
        handleCloseModal()
        return
      }

      // College wizard flow
      if (state.currentStep === 1) {
        const body = {
          college_name: state.college_name,
          college_code: state.college_code,
          college_email: state.college_email,
          college_phone: state.college_phone,
          college_address: state.college_address,
          institution: state?.profile_institution?.institution_id
        }
        console.log('✌️body --->', body)

        try {
          await CreateCollege.validate(body, { abortEarly: false })
          setState({ errors: {} })
        } catch (validationError: any) {
          const errors = {}
          validationError.inner.forEach((error: any) => {
            errors[error.path] = error.message
          })
          setState({ errors })
          return
        }

        if (state.editId) {
          const res = await Models.college.update(body, state.editId)
          Success('College updated successfully!')
          handleCloseModal()
        } else {
          // Just validate and move to next step, don't create college yet
          setState({
            currentStep: 2,
            completedSteps: [1],
            errors: {}
          })
          return // Don't close modal, move to step 2
        }
      } else if (state.currentStep === 2) {
        // Validate department details and create all entities (Final Step)
        if (!state.department_name || !state.department_code) {
          setState({
            errors: {
              department_name: 'Department name is required',
              department_code: 'Department code is required'
            }
          })
          return
        }

        let createdRecords = {
          collegeId: null,
          departmentId: null
        }

        try {
          // Step 2.1: Create college first
          const collegeBody = {
            college_name: state.college_name,
            college_code: state.college_code,
            college_email: state.college_email,
            college_phone: state.college_phone,
            college_address: state.college_address,
            institution: state?.profile_institution?.institution_id
          }

          console.log('Step 2.1: Creating college...', collegeBody)
          const collegeRes: any = await Models.college.create(collegeBody)
          createdRecords.collegeId = collegeRes?.id
          console.log(
            'Step 2.1: College created successfully with ID:',
            createdRecords.collegeId
          )

          // Step 2.2: Create department with the created college ID
          const deptBody = {
            department_name: state.department_name,
            department_code: state.department_code,
            college: collegeRes?.id,
            institution: state?.profile_institution?.institution_id
          }

          console.log('Step 2.2: Creating department...', deptBody)
          const deptRes: any = await Models.department.create(deptBody)
          createdRecords.departmentId = deptRes?.id
          console.log(
            'Step 2.2: Department created successfully with ID:',
            createdRecords.departmentId
          )

          Success('College and Department created successfully!')
          handleCloseModal()
          collegeList(state.page)
        } catch (error: any) {
          console.error('Step 2 Error Details:', error)
          await rollbackCreatedRecords(createdRecords)
          Failure('Operation failed. Please try again.')
        }
      }
    } catch (error: any) {
      console.error('Unexpected error in handleSubmit:', error)
      Failure('Operation failed. Please try again.')
    } finally {
      setState({ submitting: false })
    }
  }

  const updateCollege = async () => {
    try {
      const body = {
        college_name: state.college_name,
        college_code: state.college_code,
        college_email: state.college_email,
        college_phone: state.college_phone,
        college_address: state.college_address,
        institution: state?.institution?.value
      }

      console.log('✌️body --->', body)

      await CreateCollege.validate(body, { abortEarly: false })
      const res = await Models.college.update(body, state.editId)
      console.log('✌️res --->', res)
      collegeList(1)
      handleCloseModal()
    } catch (error) {
      console.log('✌️error --->', error)
      Failure('Operation failed. Please try again.')
    }
  }

  const renderCollegeForm = () => (
    <div className='space-y-6'>
      <TextInput
        title='Institution'
        placeholder='Institution'
        value={state.profile_institution?.institution_name}
        onChange={e => {}}
        disabled
      />
      <TextInput
        title='College Name'
        placeholder='Enter college name'
        value={state.college_name}
        onChange={e => handleFormChange('college_name', e.target.value)}
        error={state.errors.college_name}
        required
      />
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <TextInput
          title='Email Address'
          type='email'
          placeholder='college@example.com'
          value={state.college_email}
          onChange={e => handleFormChange('college_email', e.target.value)}
          error={state.errors.college_email}
          required
        />
        <TextInput
          title='College Code'
          placeholder='Enter college code'
          value={state.college_code}
          onChange={e => handleFormChange('college_code', e.target.value)}
          error={state.errors.college_code}
          required
        />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <CustomPhoneInput
          title='Phone Number'
          value={state.college_phone}
          onChange={value => handleFormChange('college_phone', value)}
          error={state.errors.college_phone}
          required
        />
        <TextArea
          title='Address'
          placeholder='Enter college address'
          value={state.college_address}
          onChange={e => handleFormChange('college_address', e.target.value)}
          error={state.errors.college_address}
          rows={3}
          required
        />
      </div>
    </div>
  )

  const renderDepartmentForm = () => (
    <div className='space-y-6'>
      {state.activeTab === 'departments' && (
        <>
          <TextInput
            title='Institution'
            placeholder='Institution'
            value={state.profile_institution?.institution_name}
            onChange={e => {}}
            disabled
          />
          <CustomSelect
            options={state.collegeDropdownList}
            value={state.college}
            onChange={selectedOption =>
              setState({
                college: selectedOption,
                errors: { ...state.errors, college: '' }
              })
            }
            onSearch={searchTerm =>
              collegeDropdownList(1, searchTerm, state.profile_institution)
            }
            placeholder='Select College'
            isClearable={true}
            loadMore={() =>
              state.collegeNext &&
              collegeDropdownList(
                state.collegePage + 1,
                '',
                true,
                state.profile_institution
              )
            }
            loading={state.collegeLoading}
            title='Select College'
            error={state.errors.college}
            required
          />
        </>
      )}
      <div className='space-y-4 pt-3'>
        <TextInput
          title='Department Name'
          placeholder='Enter department name'
          value={state.department_name}
          onChange={e => handleFormChange('department_name', e.target.value)}
          error={state.errors.department_name}
          required
        />
        <TextInput
          title='Department Code'
          placeholder='Enter department code'
          value={state.department_code}
          onChange={e => handleFormChange('department_code', e.target.value)}
          error={state.errors.department_code}
          required
        />
      </div>
    </div>
  )

  const collegeColumns = [
    {
      accessor: 'college_code',
      title: 'College Code',
      sortable: true,
      render: ({ college_code }) => (
        <span className='inline-flex items-center justify-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
          {college_code}
        </span>
      )
    },
    {
      accessor: 'college_name',
      title: 'College Name',
      sortable: true,
      render: ({ college_name }) => (
        <div className='font-medium text-gray-900 dark:text-white'>
          {college_name}
        </div>
      )
    },

    {
      accessor: 'institution_name',
      title: 'Institution',
      sortable: true,
      render: ({ institution_name }) => (
        <div className='font-medium text-gray-900 dark:text-white'>
          {institution_name}
        </div>
      )
    },

    {
      accessor: 'college_email',
      title: 'Email',
      sortable: true,
      render: ({ college_email }) => (
        <span className='text-gray-600 dark:text-gray-400'>
          {college_email}
        </span>
      )
    },
    {
      accessor: 'college_phone',
      title: 'Phone',
      render: ({ college_phone }) => (
        <div className='text-gray-600 dark:text-gray-400'>{college_phone}</div>
      )
    },

    {
      accessor: 'total_departments',
      title: 'Total Departments',
      render: ({ total_departments }) => (
        <div className='text-gray-600 dark:text-gray-400'>
          {total_departments}
        </div>
      ),
      sortable: true
    },
    {
      accessor: 'total_jobs',
      title: 'Total Jobs',
      render: ({ total_jobs }) => (
        <div className='text-gray-600 dark:text-gray-400'>{total_jobs}</div>
      ),
      sortable: true
    },

    {
      accessor: 'actions',
      title: 'Actions',
      textAlign: 'center',
      render: row => (
        <div className='flex items-center justify-center gap-2'>
          <button
            onClick={() => handleEdit(row)}
            className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-all duration-200 hover:bg-blue-200'
            title='Edit'
          >
            <IconEdit className='h-4 w-4' />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
              row.status === 'active'
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
            title={row.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            {row.status === 'active' ? (
              <IconEye className='h-4 w-4' />
            ) : (
              <IconEyeOff className='h-4 w-4' />
            )}
          </button>
          <button
            onClick={() => handleDelete(row)}
            className='flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-all duration-200 hover:bg-red-200'
            title='Delete'
          >
            <IconTrash className='h-4 w-4' />
          </button>
        </div>
      )
    }
  ]

  const departmentColumns = [
    {
      accessor: 'department_code',
      title: 'Department Code',
      sortable: true,
      render: ({ department_code }) => (
        <span className='inline-flex items-center justify-center rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200'>
          {department_code}
        </span>
      )
    },
    {
      accessor: 'department_name',
      title: 'Department Name',
      sortable: true,
      render: ({ department_name }) => (
        <div className='font-medium text-gray-900 dark:text-white'>
          {department_name}
        </div>
      )
    },
    {
      accessor: 'college_name',
      title: 'College ',
      sortable: true,
      render: ({ college_name }) => (
        <div className='font-medium text-gray-900 dark:text-white'>
          {college_name}
        </div>
      )
    },

    {
      accessor: 'total_jobs',
      title: 'Total Jobs',
      sortable: true,
      render: ({ total_jobs }) => (
        <span className='text-gray-600 dark:text-gray-400'>{total_jobs}</span>
      )
    },
    {
      accessor: 'department_head',
      title: 'Department Head',
      render: ({ department_head }) => (
        <div className='text-gray-600 dark:text-gray-400'>
          {department_head}
        </div>
      )
    },
    {
      accessor: 'actions',
      title: 'Actions',
      textAlign: 'center',
      render: row => (
        <div className='flex items-center justify-center gap-2'>
          <button
            onClick={() => handleEdit(row)}
            className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-all duration-200 hover:bg-blue-200'
            title='Edit'
          >
            <IconEdit className='h-4 w-4' />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
              row.status === 'active'
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
            title={row.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            {row.status === 'active' ? (
              <IconEye className='h-4 w-4' />
            ) : (
              <IconEyeOff className='h-4 w-4' />
            )}
          </button>
          <button
            onClick={() => handleDelete(row)}
            className='flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-all duration-200 hover:bg-red-200'
            title='Delete'
          >
            <IconTrash className='h-4 w-4' />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 dark:from-gray-900 dark:to-gray-800'>
      {/* Header Section */}
      <div className='mb-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-2'>
            <h1 className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent'>
              Colleges & Departments
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Manage colleges and departments
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
            className='group relative inline-flex transform items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl'
          >
            <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100'></div>
            <IconPlus className='relative z-10 h-5 w-5' />
            <span className='relative z-10'>
              Add {state.activeTab === 'colleges' ? 'College' : 'Department'}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className='mb-6'>
        <div className='inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800'>
          <button
            onClick={() => handleTabChange('colleges')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              state.activeTab === 'colleges'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Colleges
          </button>
          <button
            onClick={() => handleTabChange('departments')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              state.activeTab === 'departments'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Departments
          </button>
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
              placeholder={`Search ${state.activeTab}...`}
              value={state.search}
              onChange={e => setState({ search: e.target.value })}
              icon={<IconSearch className='h-4 w-4' />}
              className='transition-all duration-200 focus:shadow-lg group-hover:shadow-md'
            />
          </div>
          {state.activeTab === 'departments' && (
            <div className='group relative z-50'>
              <CustomSelect
                options={state.collegeFilterOptions}
                value={state.collegeFilter}
                onChange={handleCollegeFilterChange}
                placeholder='Select College'
                isClearable={true}
                isSearchable={true}
                onSearch={handleCollegeFilterSearch}
                loadMore={handleLoadMoreColleges}
                loading={state.collegeFilterLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800'>
        <div className='border-b border-gray-200 p-6 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
              {state.activeTab === 'colleges' ? 'Colleges' : 'Departments'} List
            </h3>
            <div className='flex items-center gap-4'>
              {state.selectedRecords.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className='flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600'
                >
                  <IconTrash className='h-4 w-4' />
                  Delete ({state.selectedRecords.length})
                </button>
              )}
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                {state.activeTab === 'colleges'
                  ? state.collegeCount
                  : state.departmentCount}{' '}
                records found
              </div>
            </div>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <DataTable
            noRecordsText={`No ${state.activeTab} found`}
            highlightOnHover
            className='table-hover whitespace-nowrap'
            records={
              state.activeTab === 'colleges'
                ? state.collegeList || []
                : state.deptList || []
            }
            fetching={state.loading}
            selectedRecords={(state.activeTab === 'colleges'
              ? state.collegeList || []
              : state.deptList || []
            ).filter(record => state.selectedRecords.includes(record.id))}
            onSelectedRecordsChange={records =>
              setState({ selectedRecords: records.map(r => r.id) })
            }
            customLoader={
              <div className='flex items-center justify-center py-12'>
                <div className='flex items-center gap-3'>
                  <IconLoader className='h-6 w-6 animate-spin text-blue-600' />
                  <span className='text-gray-600 dark:text-gray-400'>
                    Loading {state.activeTab}...
                  </span>
                </div>
              </div>
            }
            columns={
              state.activeTab === 'colleges'
                ? collegeColumns
                : departmentColumns
            }
            sortStatus={{
              columnAccessor: state.sortBy,
              direction: state.sortOrder
            }}
            onSortStatusChange={({ columnAccessor, direction }) => {
              setState({
                sortBy: columnAccessor,
                sortOrder: direction,
                page: 1
              })
              if (state.activeTab === 'colleges') {
                collegeList(1)
              } else {
                deptList(1)
              }
            }}
            minHeight={200}
          />
        </div>

        <div className='border-t border-gray-200 p-6 dark:border-gray-700'>
          <Pagination
            activeNumber={handlePageChange}
            totalPage={
              state.activeTab === 'colleges'
                ? state.collegeCount
                : state.departmentCount
            }
            currentPages={state.page}
            pageSize={state.pageSize}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={state.showModal}
        close={handleCloseModal}
        addHeader={
          state.activeTab === 'colleges'
            ? 'College & Department Setup'
            : 'Add Department'
        }
        renderComponent={() => (
          <div className='w-full max-w-4xl'>
            <style jsx>{`
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {/* Progress Header */}
            {state.activeTab === 'colleges' && (
              <div className='border-b py-6'>
                <div className='scrollbar-hide overflow-x-auto'>
                  <div className='flex min-w-max items-center justify-center gap-24 px-4'>
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className='flex items-center'
                        data-step={step.id}
                      >
                        <div
                          className={`
                          flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium
                          ${
                            isStepCompleted(step.id)
                              ? 'bg-green-500 text-white'
                              : state.currentStep === step.id
                              ? 'bg-blue-500 text-white'
                              : isStepAccessible(step.id)
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-gray-100 text-gray-400'
                          }
                        `}
                        >
                          {isStepCompleted(step.id) ? (
                            '✓'
                          ) : (
                            <step.icon className='h-5 w-5' />
                          )}
                        </div>
                        <span className='ml-2 whitespace-nowrap text-sm font-medium'>
                          {step.name}
                        </span>
                        {index < steps.length - 1 && (
                          <div
                            className={`mx-8 h-0.5 w-16 ${
                              isStepCompleted(step.id)
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step Content */}
            <div className='min-h-[300px]'>
              {state.activeTab === 'departments' ? (
                renderDepartmentForm()
              ) : (
                <>
                  {state.currentStep === 1 && renderCollegeForm()}
                  {state.currentStep === 2 && renderDepartmentForm()}
                </>
              )}
            </div>

            {/* Navigation Footer */}
            <div className='flex justify-between border-t p-6'>
              {state.activeTab === 'departments' ? (
                <div className='flex w-full justify-end gap-4'>
                  <button
                    onClick={handleCloseModal}
                    disabled={state.submitting}
                    className='rounded-lg border px-6 py-2 text-black hover:bg-green-600 disabled:opacity-50'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={state.submitting}
                    className='rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:opacity-50'
                  >
                    {state.submitting
                      ? 'Updating...'
                      : state.editId
                      ? 'Update Department'
                      : 'Create Department'}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() =>
                      setState({
                        currentStep: Math.max(1, state.currentStep - 1)
                      })
                    }
                    disabled={state.currentStep === 1}
                    className='px-4 py-2 text-gray-600 disabled:opacity-50'
                  >
                    Previous
                  </button>

                  <div className='flex gap-2'>
                    {state.currentStep !== steps.length && (
                      <button
                        onClick={handleFinalSubmit}
                        disabled={state.submitting}
                        className='rounded-lg bg-green-500 px-6 py-2 text-white hover:bg-green-600 disabled:opacity-50'
                      >
                        {state.submitting ? 'Creating...' : 'Submit'}
                      </button>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={state.submitting}
                      className='rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:opacity-50'
                    >
                      {state.submitting
                        ? 'Creating...'
                        : state.currentStep === 1
                        ? 'Save & Next'
                        : 'Submit'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      />
      <Modal
        open={state.showEditModal}
        close={handleCloseModal}
        addHeader='Edit College'
        renderComponent={() => (
          <div className='w-full max-w-4xl'>
            <div className='min-h-[300px]'>{renderCollegeForm()}</div>

            <div className='flex justify-between p-6'>
              <div className='flex w-full justify-end gap-4'>
                <button
                  onClick={handleCloseModal}
                  disabled={state.submitting}
                  className='rounded-lg border px-6 py-2 text-black hover:bg-green-600 disabled:opacity-50'
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateCollege()}
                  disabled={state.submitting}
                  className='rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:opacity-50'
                >
                  {state.submitting ? 'Updating...' : 'Update College'}
                </button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  )
}

export default PrivateRouter(CollegeAndDepartment)