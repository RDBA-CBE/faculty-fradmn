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
import {
  Building2,
  User,
  GraduationCap,
  BookOpen,
  UserCheck,
  Briefcase,
  Play,
  Pause,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import Pagination from '@/components/pagination/pagination'
import PrimaryButton from '@/components/FormFields/PrimaryButton.component'
import { showDeleteAlert, useSetState } from '@/utils/function.utils'
import Modal from '@/components/modal/modal.component'
import {
  CreateInstituion,
  CreateInstitutionAdmin,
  CreateCollege,
  CreateCollegeForm,
  CreateHR,
  CreateHOD,
  CreateDepartment
} from '@/utils/validation.utils'
import { Models } from '@/imports/models.import'
import { Success, Failure } from '@/utils/function.utils'
import useDebounce from '@/hook/useDebounce'
import Swal from 'sweetalert2'
import { GENDER_OPTION } from '@/utils/constant.utils'

const Institution = () => {
  const dispatch = useDispatch()
  const [state, setState] = useSetState({
    page: 1,
    pageSize: 10,
    recordsData: [],
    totalRecords: 0,
    search: '',
    statusFilter: null,
    typeFilter: null,
    showModal: false,
    loading: false,
    submitting: false,
    sortBy: '',
    sortOrder: 'asc',
    showEditModal: false,

    // Wizard state
    currentStep: 1,
    completedSteps: [],

    // Selection state
    selectedRecords: [],

    // API response IDs
    institutionId: null,
    institutionAdminId: null,
    collegeId: null,
    hrId: null,
    departmentId: null,
    hodId: null,

    // Institution fields
    institution_name: '',
    institution_code: '',
    institution_email: '',
    institution_phone: '',
    address: '',

    // Admin fields
    admin_username: '',
    admin_email: '',
    admin_phone: '',
    admin_password: '',
    admin_confirm_password: '',
    admin_gender: null,
    admin_education_qualification: '',
    showAdminPassword: false,
    showAdminConfirmPassword: false,

    // HR fields
    hr_username: '',
    hr_email: '',
    hr_phone: '',
    hr_password: '',
    hr_confirm_password: '',
    hr_gender: null,
    hr_qualification: '',
    showHRPassword: false,
    showHRConfirmPassword: false,

    // College fields
    colleges: [],
    college_name: '',
    college_code: '',
    college_email: '',
    college_phone: '',
    college_address: '',

    // Department fields
    departments: [],
    department_name: '',
    department_code: '',
    selectedCollege: null,

    // HOD fields
    hod_username: '',
    hod_email: '',
    hod_phone: '',
    hod_password: '',
    hod_confirm_password: '',
    hod_gender: null,
    hod_qualification: '',
    hod_experience: '',
    selectedDepartment: null,
    showHODPassword: false,
    showHODConfirmPassword: false,

    // Job fields
    job_title: '',
    job_description: '',
    job_requirements: '',
    job_salary_min: '',
    job_salary_max: '',
    job_department: null,

    errors: {},
    count: 0,
    instutionList: [],
    next: null,
    prev: null,
    editId: null
  })

  const steps = [
    { id: 1, name: 'Institution', icon: Building2, required: true },
    { id: 2, name: 'Institution Admin', icon: User, required: false },
    { id: 3, name: 'Create HR', icon: UserCheck, required: false },
    { id: 4, name: 'College', icon: GraduationCap, required: false },
    { id: 5, name: 'Department HOD', icon: UserCheck, required: false },
    { id: 6, name: 'Department', icon: BookOpen, required: false }
  ]

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ]

  const typeOptions = [
    { value: 'University', label: 'University' },
    { value: 'Institute', label: 'Institute' },
    { value: 'College', label: 'College' }
  ]

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ]

  const isStepCompleted = (stepId: number) =>
    state.completedSteps.includes(stepId)
  const isStepAccessible = (stepId: number) =>
    stepId === 1 || isStepCompleted(stepId - 1)

  const handleStepComplete = async (stepId: number, skipToNext = true) => {
    try {
      setState({ submitting: true })

      // Validate current step
      if (stepId === 1) {
        const body = {
          institution_name: state.institution_name,
          institution_code: state.institution_code,
          institution_email: state.institution_email,
          institution_phone: state.institution_phone,
          address: state.address
        }
        await CreateInstituion.validate(body, { abortEarly: false })
      }

      if (stepId === 2) {
        const adminBody = {
          username: state.admin_username,
          email: state.admin_email,
          password: state.admin_password,
          password_confirm: state.admin_confirm_password,
          phone: state.admin_phone,
          gender: state.admin_gender?.value,
          education_qualification: state.admin_education_qualification
        }
        console.log('Step 2 validation data:', adminBody)
        await CreateInstitutionAdmin.validate(adminBody, { abortEarly: false })
      }

      if (stepId === 3) {
        const hrBody = {
          hr_username: state.hr_username,
          hr_email: state.hr_email,
          hr_password: state.hr_password,
          hr_password_confirm: state.hr_confirm_password,
          hr_phone: state.hr_phone,
          hr_gender: state.hr_gender?.value,
          hr_education_qualification: state.hr_qualification
        }
        await CreateHR.validate(hrBody, { abortEarly: false })
      }

      if (stepId === 4) {
        const collegeBody = {
          college_name: state.college_name,
          college_code: state.college_code,
          college_email: state.college_email,
          college_phone: state.college_phone,
          college_address: state.college_address
        }
        await CreateCollegeForm.validate(collegeBody, { abortEarly: false })
      }

      if (stepId === 5) {
        const hodBody = {
          hod_username: state.hod_username,
          hod_email: state.hod_email,
          hod_password: state.hod_password,
          hod_confirm_password: state.hod_confirm_password,
          hod_phone: state.hod_phone,
          hod_gender: state.hod_gender?.value,
          hod_qualification: state.hod_qualification
        }
        await CreateHOD.validate(hodBody, { abortEarly: false })
      }

      if (stepId === 6) {
        const deptBody = {
          department_name: state.department_name,
          department_code: state.department_code
        }
        await CreateDepartment.validate(deptBody, { abortEarly: false })
      }

      setState({
        completedSteps: [...state.completedSteps, stepId],
        errors: {}
      })

      if (skipToNext && stepId < steps.length) {
        const nextStep = stepId + 1
        setState({ currentStep: nextStep })

        setTimeout(() => {
          const stepElement = document.querySelector(
            `[data-step="${nextStep}"]`
          )
          if (stepElement) {
            stepElement.scrollIntoView({
              behavior: 'smooth',
              inline: 'center'
            })
          }
        }, 100)
      }
    } catch (error: any) {
      if (error?.inner) {
        const errors = {}
        error.inner.forEach(err => {
          errors[err.path] = err.message
        })
        setState({ errors })
        console.log('✌️errors --->', errors)
        return // Stop execution if validation fails
      } else {
        Failure(error?.message || 'Operation failed')
        return
      }
    } finally {
      setState({ submitting: false })
    }
  }

  const handleSkipStep = () => {
    setState({
      completedSteps: [...state.completedSteps, state.currentStep],
      currentStep: state.currentStep + 1
    })
  }

  const handleFinalSubmit = async () => {
    let createdRecords = {
      institutionId: null,
      institutionAdminId: null,
      collegeId: null,
      hrId: null,
      departmentId: null,
      hodId: null
    }

    try {
      setState({ submitting: true })

      // Get steps up to current step (including current step)
      const stepsToProcess = []
      for (let i = 1; i <= state.currentStep; i++) {
        if (state.completedSteps.includes(i) || i === state.currentStep) {
          stepsToProcess.push(i)
        }
      }
      console.log('✌️handleFinalSubmit --->', stepsToProcess)

      // Validate all steps before API calls
      for (const stepId of stepsToProcess) {
        if (stepId === 1) {
          const body = {
            institution_name: state.institution_name,
            institution_code: state.institution_code,
            institution_email: state.institution_email,
            institution_phone: state.institution_phone,
            address: state.address,
            status: 'active'
          }
          await CreateInstituion.validate(body, { abortEarly: false })
        }

        if (stepId === 2) {
          const adminBody = {
            username: state.admin_username,
            email: state.admin_email,
            password: state.admin_password,
            password_confirm: state.admin_confirm_password,
            phone: state.admin_phone,
            gender: state.admin_gender?.value,
            education_qualification: state.admin_education_qualification
          }
          await CreateInstitutionAdmin.validate(adminBody, {
            abortEarly: false
          })
        }

        if (stepId === 3) {
          const hrBody = {
            hr_username: state.hr_username,
            hr_email: state.hr_email,
            hr_password: state.hr_password,
            hr_password_confirm: state.hr_confirm_password,
            hr_phone: state.hr_phone,
            hr_gender: state.hr_gender?.value,
            hr_education_qualification: state.hr_qualification
          }
          await CreateHR.validate(hrBody, { abortEarly: false })
        }

        if (stepId === 4) {
          const collegeBody = {
            college_name: state.college_name,
            college_code: state.college_code,
            college_email: state.college_email,
            college_phone: state.college_phone,
            college_address: state.college_address
          }
          await CreateCollegeForm.validate(collegeBody, { abortEarly: false })
        }

        if (stepId === 5) {
          const hodBody = {
            hod_username: state.hod_username,
            hod_email: state.hod_email,
            hod_password: state.hod_password,
            hod_confirm_password: state.hod_confirm_password,
            hod_phone: state.hod_phone,
            hod_gender: state.hod_gender?.value,
            hod_qualification: state.hod_qualification
          }
          await CreateHOD.validate(hodBody, { abortEarly: false })
        }

        if (stepId === 6) {
          const deptBody = {
            department_name: state.department_name,
            department_code: state.department_code
          }
          await CreateDepartment.validate(deptBody, { abortEarly: false })
        }
      }

      // Step 1: Create Institution
      if (stepsToProcess.includes(1)) {
        try {
          const institutionBody = {
            institution_name: state.institution_name,
            institution_code: state.institution_code,
            institution_email: state.institution_email,
            institution_phone: state.institution_phone,
            address: state.address
          }

          const institutionRes: any = await Models.institution.create(
            institutionBody
          )
          createdRecords.institutionId = institutionRes?.id
        } catch (error: any) {
          const apiErrors = error.response.data
          let errorMessages = []

          Object.keys(apiErrors).forEach(field => {
            if (Array.isArray(apiErrors[field])) {
              apiErrors[field].forEach(msg => {
                errorMessages.push(`${field}: ${msg}`)
              })
            } else {
              errorMessages.push(`${field}: ${apiErrors[field]}`)
            }
          })

          throw new Error(errorMessages.join('\n'))
        }

        // Step 2: Create Institution Admin
        if (stepsToProcess.includes(2)) {
          try {
            const adminBody = {
              username: state.admin_username,
              email: state.admin_email,
              password: state.admin_password,
              password_confirm: state.admin_confirm_password,
              phone: state.admin_phone,
              role: 'institution_admin',
              status: 'active',
              gender: state.admin_gender?.value,
              education_qualification: state.admin_education_qualification,
              institution: createdRecords.institutionId
            }
            const adminRes: any = await Models.auth.createUser(adminBody)
            createdRecords.institutionAdminId = adminRes?.id
          } catch (error: any) {
            if (error?.response?.data) {
              const apiErrors = error.response.data
              let errorMessages = []

              Object.keys(apiErrors).forEach(field => {
                if (Array.isArray(apiErrors[field])) {
                  apiErrors[field].forEach(msg => {
                    errorMessages.push(`${field}: ${msg}`)
                  })
                } else {
                  errorMessages.push(`${field}: ${apiErrors[field]}`)
                }
              })

              throw new Error(
                `${errorMessages.join(
                  '\n'
                )}`
              )
            }
            throw new Error(
              `${error?.message}`
            )
          }
        }

        // Step 3: Create HR
        if (stepsToProcess.includes(3)) {
          try {
            const hrBody = {
              username: state.hr_username,
              email: state.hr_email,
              password: state.hr_password,
              password_confirm: state.hr_confirm_password,
              phone: state.hr_phone,
              role: 'hr',
              status: 'active',
              gender: state.hr_gender?.value,
              education_qualification: state.hr_qualification,
              institution: createdRecords.institutionId
            }
            const hrRes: any = await Models.auth.createUser(hrBody)
            createdRecords.hrId = hrRes?.id
          } catch (error: any) {
            throw new Error(`HR creation failed: ${error?.message}`)
          }
        }

        // Step 4: Create College
        if (stepsToProcess.includes(4)) {
          try {
            const collegeBody = {
              college_name: state.college_name,
              college_code: state.college_code,
              college_email: state.college_email,
              college_phone: state.college_phone,
              college_address: state.college_address,
              institution: createdRecords.institutionId
            }
            const collegeRes: any = await Models.college.create(collegeBody)
            createdRecords.collegeId = collegeRes?.id
          } catch (error: any) {
            throw new Error(`College creation failed: ${error?.message}`)
          }
        }

        // Step 5: Create HOD
        if (stepsToProcess.includes(5)) {
          try {
            const hodBody = {
              username: state.hod_username,
              email: state.hod_email,
              password: state.hod_password,
              password_confirm: state.hod_confirm_password,
              phone: state.hod_phone,
              role: 'hod',
              status: 'active',
              gender: state.hod_gender?.value,
              education_qualification: state.hod_qualification,
              college: createdRecords.collegeId
            }
            const hodRes: any = await Models.auth.createUser(hodBody)
            createdRecords.hodId = hodRes?.id
          } catch (error: any) {
            throw new Error(`HOD creation failed: ${error?.message}`)
          }
        }

        // Step 6: Create Department
        if (stepsToProcess.includes(6)) {
          try {
            const deptBody = {
              department_name: state.department_name,
              department_code: state.department_code,
              college: createdRecords.collegeId,
              institution: createdRecords.institutionId
            }
            const deptRes: any = await Models.department.create(deptBody)
            createdRecords.departmentId = deptRes?.id
          } catch (error: any) {
            throw new Error(`Department creation failed: ${error?.message}`)
          }
        }
      }

      // Generate success message based on created entities
      let successMessage = ''
      const createdEntities = []
      if (createdRecords.institutionId) {
        createdEntities.push('Institution')
      }
      if (createdRecords.institutionId && createdRecords.institutionAdminId) {
        createdEntities.push('Institution with Admin')
      }
      if (
        createdRecords.institutionId &&
        createdRecords.institutionAdminId &&
        createdRecords.collegeId
      ) {
        createdEntities.push('Institution , Admin and College')
      }
      if (
        createdRecords.institutionId &&
        createdRecords.institutionAdminId &&
        createdRecords.collegeId &&
        createdRecords.hrId
      ) {
        createdEntities.push('Institution , Admin , College and HR')
      }

      if (
        createdRecords.institutionId &&
        createdRecords.institutionAdminId &&
        createdRecords.collegeId &&
        createdRecords.hodId
      ) {
        createdEntities.push('Institution , Admin , College , HR and HOD')
      }

      if (
        createdRecords.institutionId &&
        createdRecords.institutionAdminId &&
        createdRecords.collegeId &&
        createdRecords.departmentId &&
        createdRecords.hodId
      ) {
        createdEntities.push(
          'Institution , Admin , College , HR , HOD and Department'
        )
      }

      if (createdEntities.length > 0) {
        successMessage = `${createdEntities.join(
          ' and '
        )} created successfully!`
      } else {
        successMessage = 'created successfully!'
      }

      Success(successMessage)
      instutionList(state.page)
      handleCloseModal()
    } catch (error: any) {
      if (error?.inner) {
        const errors = {}
        error.inner.forEach(err => {
          errors[err.path] = err.message
        })
        setState({ errors })
        console.log('✌️errors --->', errors)
        return // Stop execution if validation fails
      } else {
        // Rollback created records
        await rollbackCreatedRecords(createdRecords)
        Failure(
          error?.message ||
            'Setup failed. All created records have been removed.'
        )
      }
    } finally {
      setState({ submitting: false })
    }
  }

  const handleUpdate = async () => {
    try {
      setState({ btnLoading: true })
      const body = {
        institution_name: state.institution_name,
        institution_code: state.institution_code,
        institution_email: state.institution_email,
        institution_phone: state.institution_phone,
        address: state.address
      }
      const res = await Models.institution.update(body, state.editId)
      console.log('✌️res --->', res)
      instutionList(state.page)
      handleCloseModal()
      setState({ btnLoading: false })
    } catch (error) {
      setState({ btnLoading: false })
    }
  }

  const handleFinishWizard = async () => {
    let createdRecords = {
      institutionId: null,
      institutionAdminId: null,
      collegeId: null,
      hrId: null,
      departmentId: null,
      hodId: null
    }

    try {
      setState({ submitting: true })

      // Step 1: Create Institution
      if (state.completedSteps.includes(1)) {
        try {
          const institutionBody = {
            institution_name: state.institution_name,
            institution_code: state.institution_code,
            institution_email: state.institution_email,
            institution_phone: state.institution_phone,
            address: state.address
          }
          const institutionRes: any = await Models.institution.create(
            institutionBody
          )
          console.log('✌️institutionRes --->', institutionRes)

          createdRecords.institutionId = institutionRes?.id
        } catch (error: any) {
          throw new Error(`Institution creation failed: ${error?.message}`)
        }

        // Step 2: Create Institution Admin
        if (state.completedSteps.includes(2)) {
          try {
            const adminBody = {
              username: state.admin_username,
              email: state.admin_email,
              password: state.admin_password,
              password_confirm: state.admin_confirm_password,
              phone: state.admin_phone,
              role: 'institution_admin',
              status: 'active',
              gender: state.admin_gender?.value,
              education_qualification: state.admin_education_qualification,
              institution: createdRecords.institutionId
            }
            const adminRes: any = await Models.auth.createUser(adminBody)
            createdRecords.institutionAdminId = adminRes?.id
          } catch (error: any) {
            // Handle API validation errors
            if (error?.response?.data) {
              const apiErrors = error.response.data
              let errorMessages = []

              Object.keys(apiErrors).forEach(field => {
                if (Array.isArray(apiErrors[field])) {
                  apiErrors[field].forEach(msg => {
                    errorMessages.push(`${field}: ${msg}`)
                  })
                } else {
                  errorMessages.push(`${field}: ${apiErrors[field]}`)
                }
              })

              throw new Error(
                `Institution Admin creation failed:\n${errorMessages.join(
                  '\n'
                )}`
              )
            }
            throw new Error(
              `Institution Admin creation failed: ${error?.message}`
            )
          }
        }

        // Step 3: Create College
        if (state.completedSteps.includes(3)) {
          try {
            const collegeBody = {
              college_name: state.college_name,
              college_code: state.college_code,
              college_email: state.college_email,
              college_phone: state.college_phone,
              college_address: state.college_address,
              institution: createdRecords.institutionId
            }
            const collegeRes: any = await Models.college.create(collegeBody)
            createdRecords.collegeId = collegeRes?.id
          } catch (error: any) {
            throw new Error(`College creation failed: ${error?.message}`)
          }

          // Step 4: Create HR
          if (state.completedSteps.includes(4)) {
            try {
              const hrBody = {
                username: state.hr_username,
                email: state.hr_email,
                password: state.hr_password,
                password_confirm: state.hr_confirm_password,
                phone: state.hr_phone,
                role: 'hr',
                status: 'active',
                gender: state.hr_gender?.value,
                education_qualification: state.hr_qualification,
                college: createdRecords.collegeId
              }
              const hrRes: any = await Models.auth.createUser(hrBody)
              createdRecords.hrId = hrRes?.id
            } catch (error: any) {
              if (error?.response?.data) {
                const apiErrors = error.response.data
                let errorMessages = []

                Object.keys(apiErrors).forEach(field => {
                  if (Array.isArray(apiErrors[field])) {
                    apiErrors[field].forEach(msg => {
                      errorMessages.push(`${field}: ${msg}`)
                    })
                  } else {
                    errorMessages.push(`${field}: ${apiErrors[field]}`)
                  }
                })

                throw new Error(
                  `HR creation failed:\n${errorMessages.join('\n')}`
                )
              }
              throw new Error(`HR creation failed: ${error?.message}`)
            }
          }

          // Step 5: Create Department
          if (state.completedSteps.includes(5)) {
            try {
              const deptBody = {
                department_name: state.department_name,
                department_code: state.department_code,
                college: createdRecords.collegeId,
                institution: createdRecords.institutionId
              }
              const deptRes: any = await Models.department.create(deptBody)
              createdRecords.departmentId = deptRes?.id
            } catch (error: any) {
              throw new Error(`Department creation failed: ${error?.message}`)
            }

            // Step 6: Create HOD
            if (state.completedSteps.includes(6)) {
              try {
                const hodBody = {
                  username: state.hod_username,
                  email: state.hod_email,
                  password: state.hod_password,
                  password_confirm: state.hod_confirm_password,
                  phone: state.hod_phone,
                  role: 'hod',
                  status: 'active',
                  gender: state.hod_gender?.value,
                  education_qualification: state.hod_qualification,
                  department: createdRecords.departmentId
                }
                const hodRes: any = await Models.auth.createUser(hodBody)
                createdRecords.hodId = hodRes?.id
              } catch (error: any) {
                throw new Error(`HOD creation failed: ${error?.message}`)
              }
            }
          }
        }
      }

      // Generate success message based on created entities
      let successMessage = ''
      const createdEntities = []
      console.log('✌️createdRecords --->', createdRecords)

      if (createdRecords.institutionId) createdEntities.push('Institution')
      if (createdRecords.institutionAdminId) createdEntities.push('Admin')
      if (createdRecords.collegeId) createdEntities.push('College')
      if (createdRecords.hrId) createdEntities.push('HR')
      if (createdRecords.departmentId) createdEntities.push('Department')
      if (createdRecords.hodId) createdEntities.push('HOD')

      if (createdEntities.length > 0) {
        successMessage = `${createdEntities.join(
          ' and '
        )} created successfully!`
      } else {
        successMessage = 'Setup completed successfully!'
      }

      Success(successMessage)
      handleCloseModal()
    } catch (error: any) {
      console.log('✌️error --->', error)
      // Rollback created records
      await rollbackCreatedRecords(createdRecords)
      Failure(
        error?.message || 'Setup failed. All created records have been removed.'
      )
    } finally {
      setState({ submitting: false })
    }
  }

  const rollbackCreatedRecords = async (records: any) => {
    console.log('✌️records --->', records)
    try {
      if (records.hodId) {
        await Models.auth.deleteUser(records.hodId)
        console.log('Deleted HOD:', records.hodId)
      }
      if (records.departmentId) {
        await Models.department.delete(records.departmentId)
        console.log('Deleted Department:', records.departmentId)
      }
      if (records.hrId) {
        await Models.auth.deleteUser(records.hrId)
        console.log('Deleted HR:', records.hrId)
      }
      if (records.collegeId) {
        await Models.college.delete(records.collegeId)
        console.log('Deleted College:', records.collegeId)
      }
      if (records.institutionAdminId) {
        await Models.auth.deleteUser(records.institutionAdminId)
        console.log('Deleted Institution Admin:', records.institutionAdminId)
      }
      if (records.institutionId) {
        await Models.institution.delete(records.institutionId)
        console.log('Deleted Institution:', records.institutionId)
      }
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError)
    }
  }

  const debounceSearch = useDebounce(state.search, 500)

  useEffect(() => {
    dispatch(setPageTitle('Institution'))
  }, [dispatch])

  useEffect(() => {
    instutionList(1)
  }, [])

  useEffect(() => {
    instutionList(1)
  }, [debounceSearch, state.statusFilter, state.typeFilter, state.sortBy])

  const instutionList = async (page: number) => {
    try {
      setState({ loading: true })
      const body = bodyData()

      const res: any = await Models.institution.list(page, body)
      console.log('✌️res --->', res)

      const tableData = res?.results?.map(item => ({
        institution_name: item?.institution_name,
        institution_code: item?.institution_code,
        institution_email: item?.institution_email,
        institution_phone: item?.institution_phone,
        address: item?.address,
        status: item?.status,
        id: item?.id,
        total_colleges: item?.total_colleges,
        total_departments: item?.total_departments,
        total_jobs: item?.total_jobs
      }))
      console.log('✌️tableData --->', tableData)

      setState({
        loading: false,
        page: page,
        count: res?.count,
        instutionList: tableData,
        next: res?.next,
        prev: res?.previous
      })
    } catch (error) {
      console.error('Error fetching institutions:', error)
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
    console.log('✌️body --->', body)

    return body
  }

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber })
    instutionList(pageNumber)
  }

  const handleStatusChange = (selectedOption: any) => {
    setState({ statusFilter: selectedOption, page: 1 })
  }

  const handleTypeChange = (selectedOption: any) => {
    setState({ typeFilter: selectedOption, page: 1 })
  }

  const handleCloseModal = () => {
    setState({
      showModal: false,
      currentStep: 1,
      completedSteps: [],

      // Clear all form fields
      institution_name: '',
      institution_code: '',
      institution_email: '',
      institution_phone: '',
      address: '',

      admin_username: '',
      admin_email: '',
      admin_phone: '',
      admin_password: '',
      admin_confirm_password: '',
      admin_gender: null,
      admin_education_qualification: '',

      hr_username: '',
      hr_email: '',
      hr_phone: '',
      hr_password: '',
      hr_confirm_password: '',
      hr_gender: null,
      hr_qualification: '',

      college_name: '',
      college_code: '',
      college_email: '',
      college_phone: '',
      college_address: '',

      hod_username: '',
      hod_email: '',
      hod_phone: '',
      hod_password: '',
      hod_confirm_password: '',
      hod_gender: null,
      hod_qualification: '',

      department_name: '',
      department_code: '',

      job_title: '',
      job_description: '',
      job_requirements: '',
      job_salary_min: '',
      job_salary_max: '',

      errors: {},
      editId: null,
      selectedRecords: [],
      showEditModal: false
    })
  }

  const handleFormChange = (field: string, value: any) => {
    // Map validation field names to form field names for error clearing
    const errorFieldMap: { [key: string]: string[] } = {
      admin_username: ['username', 'admin_username'],
      admin_email: ['email', 'admin_email'],
      admin_password: ['password', 'admin_password'],
      admin_confirm_password: ['password_confirm', 'admin_confirm_password'],
      admin_phone: ['phone', 'admin_phone'],
      admin_gender: ['gender', 'admin_gender'],
      admin_education_qualification: [
        'education_qualification',
        'admin_education_qualification'
      ]
    }

    const fieldsToClear = errorFieldMap[field] || [field]
    const clearedErrors = { ...state.errors }
    fieldsToClear.forEach((errorField: string) => {
      clearedErrors[errorField] = ''
    })

    setState({
      [field]: value,
      errors: clearedErrors
    })
  }

  const handleEdit = (row: any) => {
    setState({
      editId: row?.id,
      showEditModal: true,
      institution_name: row?.institution_name,
      institution_code: row?.institution_code,
      institution_email: row?.institution_email,
      institution_phone: row?.institution_phone,
      address: row?.address
    })
    // TODO: Implement edit functionality
  }

  const handleToggleStatus = async (row: any) => {
    try {
      const newStatus = row?.status === 'active' ? 'inactive' : 'active'
      const body = {
        status: newStatus
      }
      await Models.institution.update(body, row?.id)
      Success(`Institution ${row?.status.toLowerCase()} successfully!`)
      instutionList(state.page)
    } catch (error) {
      Failure('Failed to update status. Please try again.')
    }
  }

  const handleDelete = (row: any) => {
    showDeleteAlert(
      () => {
        deleteDecord(row?.id)
      },
      () => {
        Swal.fire('Cancelled', 'Your Record is safe :)', 'info')
      },
      'Are you sure want to delete record?'
    )
  }

  const deleteDecord = async id => {
    try {
      await Models.institution.delete(id)
      Success(`Institutions deleted successfully!`)
      setState({ selectedRecords: [] })
      instutionList(state.page)
    } catch (error) {
      Failure('Failed to delete institutions. Please try again.')
    }
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

  const bulkDeleteRecords = async () => {
    try {
      for (const id of state.selectedRecords) {
        await Models.institution.delete(id)
      }
      Success(
        `${state.selectedRecords.length} institutions deleted successfully!`
      )
      setState({ selectedRecords: [] })
      instutionList(state.page)
    } catch (error) {
      Failure('Failed to delete institutions. Please try again.')
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 dark:from-gray-900 dark:to-gray-800'>
      {/* Header Section */}
      <div className='mb-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-2'>
            <h1 className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent'>
              Institution Management
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Manage and organize educational institutions
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
            className='group relative inline-flex transform items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl'
          >
            <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100'></div>
            <IconPlus className='relative z-10 h-5 w-5' />
            <span className='relative z-10'>Setup Institution</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className='mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800'>
        <div className='mb-4 flex items-center gap-2'>
          {/* <IconFilter className="w-5 h-5 text-blue-600" /> */}
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
            Filters
          </h3>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='group relative'>
            <TextInput
              placeholder='Search institutions...'
              value={state.search}
              onChange={e => setState({ search: e.target.value })}
              icon={<IconSearch className='h-4 w-4' />}
              className='transition-all duration-200 focus:shadow-lg group-hover:shadow-md'
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800'>
        <div className='border-b border-gray-200 p-6 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
              Institutions List
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
                {state.count} institutions found
              </div>
            </div>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <DataTable
            noRecordsText='No institutions found'
            highlightOnHover
            className='table-hover whitespace-nowrap'
            records={state.instutionList}
            fetching={state.loading}
            selectedRecords={state.instutionList.filter(record =>
              state.selectedRecords.includes(record.id)
            )}
            onSelectedRecordsChange={records =>
              setState({ selectedRecords: records.map(r => r.id) })
            }
            customLoader={
              <div className='flex items-center justify-center py-12'>
                <div className='flex items-center gap-3'>
                  <IconLoader className='h-6 w-6 animate-spin text-blue-600' />
                  <span className='text-gray-600 dark:text-gray-400'>
                    Loading institutions...
                  </span>
                </div>
              </div>
            }
            columns={[
              {
                accessor: 'institution_code',
                title: (
                  <div className='flex items-center gap-1'>
                    Institution Code
                  </div>
                ),
                sortable: true,
                render: ({ institution_code }) => (
                  <span className='inline-flex items-center justify-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                    {institution_code}
                  </span>
                )
              },
              {
                accessor: 'institution_name',
                title: (
                  <div className='flex items-center gap-1'>
                    Institution Name
                  </div>
                ),
                sortable: true,
                render: ({ institution_name }) => (
                  <div className='font-medium text-gray-900 dark:text-white'>
                    {institution_name}
                  </div>
                )
              },
              {
                accessor: 'institution_email',
                title: (
                  <div className='flex items-center gap-1'>
                    Institution Email
                  </div>
                ),
                sortable: true,
                render: ({ institution_email }) => (
                  <span className='inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200'>
                    {institution_email}
                  </span>
                )
              },
              {
                accessor: 'institution_phone',
                title: 'Institution Phone',
                render: ({ institution_phone }) => (
                  <div className='text-gray-600 dark:text-gray-400'>
                    {institution_phone}
                  </div>
                ),
                sortable: true
              },

              {
                accessor: 'total_colleges',
                title: 'Total Colleges',
                render: ({ total_colleges }) => (
                  <div className='text-gray-600 dark:text-gray-400'>
                    {total_colleges}
                  </div>
                ),
                sortable: true
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
                  <div className='text-gray-600 dark:text-gray-400'>
                    {total_jobs}
                  </div>
                ),
                sortable: true
              },
              {
                accessor: 'actions',
                title: 'Actions',
                textAlignment: 'center',
                render: (row: any) => {
                  return (
                    <div className='flex items-center justify-center gap-2'>
                      <button
                        onClick={() => handleEdit(row)}
                        className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-all duration-200 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-400'
                        title='Edit'
                      >
                        <IconEdit className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(row)}
                        className={`group relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                          row?.status != 'active'
                            ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-400'
                            : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-400'
                        }`}
                        title={
                          row?.status === 'active' ? 'Deactivate' : 'Activate'
                        }
                      >
                        {row?.status !== 'active' ? (
                          <ToggleLeft className='h-4 w-4' />
                        ) : (
                          <ToggleRight className='h-4 w-4' />
                        )}
                      </button>
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
              instutionList(1)
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

      <Modal
        open={state.showModal}
        close={handleCloseModal}
        addHeader='Institution Setup Wizard'
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
            <div className=' border-b py-6'>
              {/* <h2 className="text-2xl font-bold mb-4">Institution Setup Wizard</h2> */}
              <div className='scrollbar-hide overflow-x-auto'>
                <div className='flex min-w-max items-center justify-between px-4'>
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
                          className={`mx-4 h-0.5 w-8 ${
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

            {/* Step Content */}
            <div className='min-h-[400px] p-6'>
              {state.currentStep === 1 && (
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold'>Institution Details</h3>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <TextInput
                      title='Institution Name'
                      placeholder='Enter institution name'
                      value={state.institution_name}
                      onChange={e =>
                        handleFormChange('institution_name', e.target.value)
                      }
                      error={state.errors.institution_name}
                      required
                    />
                    <TextInput
                      title='Institution Code'
                      placeholder='Enter unique code'
                      value={state.institution_code}
                      onChange={e =>
                        handleFormChange('institution_code', e.target.value)
                      }
                      error={state.errors.institution_code}
                      required
                    />
                  </div>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <TextInput
                      title='Email Address'
                      type='email'
                      placeholder='institution@example.com'
                      value={state.institution_email}
                      onChange={e =>
                        handleFormChange('institution_email', e.target.value)
                      }
                      error={state.errors.institution_email}
                      required
                    />
                    <CustomPhoneInput
                      title='Phone Number'
                      value={state.institution_phone}
                      onChange={value =>
                        handleFormChange('institution_phone', value)
                      }
                      error={state.errors.institution_phone}
                      required
                    />
                  </div>
                  <TextArea
                    title='Complete Address'
                    placeholder='Enter the full address'
                    value={state.address}
                    onChange={e => handleFormChange('address', e.target.value)}
                    error={state.errors.address}
                    rows={4}
                    required
                  />
                </div>
              )}

              {state.currentStep === 2 && (
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold'>Institution Admin</h3>
                  <p className='text-sm text-gray-600'>
                    Create an admin user for this institution
                  </p>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <TextInput
                      title='Username'
                      placeholder='Enter admin username'
                      value={state.admin_username}
                      onChange={e =>
                        handleFormChange('admin_username', e.target.value)
                      }
                      error={state.errors.username}
                      required
                    />
                    <TextInput
                      title='Email'
                      type='email'
                      placeholder='admin@example.com'
                      value={state.admin_email}
                      onChange={e =>
                        handleFormChange('admin_email', e.target.value)
                      }
                      error={state.errors.email}
                      autoComplete='username'
                      required
                    />
                  </div>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <TextInput
                      title='Password'
                      type={state.showAdminPassword ? 'text' : 'password'}
                      placeholder='Enter password'
                      value={state.admin_password}
                      onChange={e =>
                        handleFormChange('admin_password', e.target.value)
                      }
                      error={state.errors.password}
                      rightIcon={
                        state.showAdminPassword ? (
                          <IconEyeOff className='h-4 w-4' />
                        ) : (
                          <IconEye className='h-4 w-4' />
                        )
                      }
                      rightIconOnlick={() =>
                        setState({
                          showAdminPassword: !state.showAdminPassword
                        })
                      }
                      autoComplete='new-password'
                      required
                    />
                    <TextInput
                      title='Confirm Password'
                      type={
                        state.showAdminConfirmPassword ? 'text' : 'password'
                      }
                      placeholder='Confirm password'
                      value={state.admin_confirm_password}
                      onChange={e =>
                        handleFormChange(
                          'admin_confirm_password',
                          e.target.value
                        )
                      }
                      error={
                        state.errors.password_confirm ||
                        state.errors.admin_confirm_password
                      }
                      rightIcon={
                        state.showAdminConfirmPassword ? (
                          <IconEyeOff className='h-4 w-4' />
                        ) : (
                          <IconEye className='h-4 w-4' />
                        )
                      }
                      rightIconOnlick={() =>
                        setState({
                          showAdminConfirmPassword:
                            !state.showAdminConfirmPassword
                        })
                      }
                      required
                    />
                  </div>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <CustomPhoneInput
                      title='Phone'
                      value={state.admin_phone}
                      onChange={value => handleFormChange('admin_phone', value)}
                      error={state.errors.phone}
                      required
                    />
                    <CustomSelect
                      title='Gender'
                      options={genderOptions}
                      value={state.admin_gender}
                      onChange={selectedOption =>
                        handleFormChange('admin_gender', selectedOption)
                      }
                      placeholder='Select Gender'
                      error={state.errors.gender}
                      required
                    />
                  </div>
                  <TextInput
                    title='Education Qualification'
                    placeholder='Enter education qualification'
                    value={state.admin_education_qualification}
                    onChange={e =>
                      handleFormChange(
                        'admin_education_qualification',
                        e.target.value
                      )
                    }
                    error={state.errors.education_qualification}
                    required
                  />
                </div>
              )}

              {state.currentStep === 3 && (
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold'>Create HR</h3>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <TextInput
                      title='HR Name'
                      placeholder='Enter HR name'
                      value={state.hr_username}
                      onChange={e =>
                        handleFormChange('hr_username', e.target.value)
                      }
                      error={state.errors.hr_username}
                      required
                    />
                    <TextInput
                      title='HR Email'
                      type='email'
                      placeholder='hr@example.com'
                      value={state.hr_email}
                      onChange={e =>
                        handleFormChange('hr_email', e.target.value)
                      }
                      error={state.errors.hr_email}
                      autoComplete='username'
                      required
                    />
                  </div>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <TextInput
                      title='HR Password'
                      type={state.showHRPassword ? 'text' : 'password'}
                      placeholder='Enter password'
                      value={state.hr_password}
                      onChange={e =>
                        handleFormChange('hr_password', e.target.value)
                      }
                      error={state.errors.hr_password}
                      rightIcon={
                        state.showHRPassword ? (
                          <IconEyeOff className='h-4 w-4' />
                        ) : (
                          <IconEye className='h-4 w-4' />
                        )
                      }
                      rightIconOnlick={() =>
                        setState({ showHRPassword: !state.showHRPassword })
                      }
                      autoComplete='new-password'
                      required
                    />
                    <TextInput
                      title='HR Confirm Password'
                      type={state.showHRConfirmPassword ? 'text' : 'password'}
                      placeholder='Confirm password'
                      value={state.hr_confirm_password}
                      onChange={e =>
                        handleFormChange('hr_confirm_password', e.target.value)
                      }
                      error={state.errors.hr_password_confirm}
                      rightIcon={
                        state.showHRConfirmPassword ? (
                          <IconEyeOff className='h-4 w-4' />
                        ) : (
                          <IconEye className='h-4 w-4' />
                        )
                      }
                      rightIconOnlick={() =>
                        setState({
                          showHRConfirmPassword: !state.showHRConfirmPassword
                        })
                      }
                      required
                    />
                  </div>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <CustomPhoneInput
                      title='Phone Number'
                      value={state.hr_phone}
                      onChange={value => handleFormChange('hr_phone', value)}
                      error={state.errors.hr_phone}
                      required
                    />
                    <CustomSelect
                      title='Gender'
                      options={genderOptions}
                      value={state.hr_gender}
                      onChange={selectedOption =>
                        handleFormChange('hr_gender', selectedOption)
                      }
                      placeholder='Select Gender'
                      error={state.errors.hr_gender}
                      required
                    />
                  </div>
                  <TextInput
                    title='Qualification'
                    placeholder='Enter qualification'
                    value={state.hr_qualification}
                    onChange={e =>
                      handleFormChange('hr_qualification', e.target.value)
                    }
                    error={state.errors.hr_qualification}
                    required
                  />
                </div>
              )}

              {state.currentStep === 4 && (
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold'>Create College</h3>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <TextInput
                      title='College Name'
                      placeholder='Enter college name'
                      value={state.college_name}
                      onChange={e =>
                        handleFormChange('college_name', e.target.value)
                      }
                      error={state.errors.college_name}
                      required
                    />
                    <TextInput
                      title='Email Address'
                      type='email'
                      placeholder='college@example.com'
                      value={state.college_email}
                      onChange={e =>
                        handleFormChange('college_email', e.target.value)
                      }
                      error={state.errors.college_email}
                      required
                    />
                  </div>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <TextInput
                      title='College Code'
                      placeholder='Enter college code'
                      value={state.college_code}
                      onChange={e =>
                        handleFormChange('college_code', e.target.value)
                      }
                      error={state.errors.college_code}
                      required
                    />
                    <CustomPhoneInput
                      title='Phone Number'
                      value={state.college_phone}
                      onChange={value =>
                        handleFormChange('college_phone', value)
                      }
                      error={state.errors.college_phone}
                      required
                    />
                  </div>
                  <TextArea
                    title='Address'
                    placeholder='Enter college address'
                    value={state.college_address}
                    onChange={e =>
                      handleFormChange('college_address', e.target.value)
                    }
                    error={state.errors.college_address}
                    rows={3}
                    required
                  />
                </div>
              )}

              {state.currentStep === 5 && (
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold'>Department HOD</h3>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <TextInput
                      title='HOD Name'
                      placeholder='Enter HOD name'
                      value={state.hod_username}
                      onChange={e =>
                        handleFormChange('hod_username', e.target.value)
                      }
                      error={state.errors.hod_username}
                      required
                    />
                    <TextInput
                      title='HOD Email'
                      type='email'
                      placeholder='hod@example.com'
                      value={state.hod_email}
                      onChange={e =>
                        handleFormChange('hod_email', e.target.value)
                      }
                      error={state.errors.hod_email}
                      required
                    />
                  </div>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <TextInput
                      title='HOD Password'
                      type={state.showHODPassword ? 'text' : 'password'}
                      placeholder='Enter password'
                      value={state.hod_password}
                      onChange={e =>
                        handleFormChange('hod_password', e.target.value)
                      }
                      error={state.errors.hod_password}
                      rightIcon={
                        state.showHODPassword ? (
                          <IconEyeOff className='h-4 w-4' />
                        ) : (
                          <IconEye className='h-4 w-4' />
                        )
                      }
                      rightIconOnlick={() =>
                        setState({ showHODPassword: !state.showHODPassword })
                      }
                      required
                    />
                    <TextInput
                      title='HOD Confirm Password'
                      type={state.showHODConfirmPassword ? 'text' : 'password'}
                      placeholder='Confirm password'
                      value={state.hod_confirm_password}
                      onChange={e =>
                        handleFormChange('hod_confirm_password', e.target.value)
                      }
                      error={state.errors.hod_confirm_password}
                      rightIcon={
                        state.showHODConfirmPassword ? (
                          <IconEyeOff className='h-4 w-4' />
                        ) : (
                          <IconEye className='h-4 w-4' />
                        )
                      }
                      rightIconOnlick={() =>
                        setState({
                          showHODConfirmPassword: !state.showHODConfirmPassword
                        })
                      }
                      required
                    />
                  </div>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <CustomPhoneInput
                      title='Phone Number'
                      value={state.hod_phone}
                      onChange={value => handleFormChange('hod_phone', value)}
                      error={state.errors.hod_phone}
                      required
                    />
                    <CustomSelect
                      title='Gender'
                      options={genderOptions}
                      value={state.hod_gender}
                      onChange={selectedOption =>
                        handleFormChange('hod_gender', selectedOption)
                      }
                      placeholder='Select Gender'
                      error={state.errors.hod_gender}
                      required
                    />
                  </div>
                  <TextInput
                    title='Qualification'
                    placeholder='Enter qualification'
                    value={state.hod_qualification}
                    onChange={e =>
                      handleFormChange('hod_qualification', e.target.value)
                    }
                    error={state.errors.hod_qualification}
                    required
                  />
                </div>
              )}

              {state.currentStep === 6 && (
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold'>Create Department</h3>
                  <TextInput
                    title='Department Name'
                    placeholder='Enter department name'
                    value={state.department_name}
                    onChange={e =>
                      handleFormChange('department_name', e.target.value)
                    }
                    error={state.errors.department_name}
                    required
                  />
                  <TextInput
                    title='Department Code'
                    placeholder='Enter department code'
                    value={state.department_code}
                    onChange={e =>
                      handleFormChange('department_code', e.target.value)
                    }
                    error={state.errors.department_code}
                    required
                  />
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className='flex justify-between border-t p-6'>
              <button
                onClick={() => {
                  const newStep = Math.max(1, state.currentStep - 1)
                  setState({ currentStep: newStep })
                  setTimeout(() => {
                    const stepElement = document.querySelector(
                      `[data-step="${newStep}"]`
                    )
                    if (stepElement) {
                      stepElement.scrollIntoView({
                        behavior: 'smooth',
                        inline: 'center'
                      })
                    }
                  }, 100)
                }}
                disabled={state.currentStep === 1}
                className='px-4 py-2 text-gray-600 disabled:opacity-50'
              >
                Previous
              </button>

              <div className='flex gap-2'>
                <button
                  onClick={handleFinalSubmit}
                  className='rounded-lg bg-green-500 px-6 py-2 text-white hover:bg-green-600'
                >
                  Submit
                </button>
                {state.currentStep < steps.length ? (
                  <button
                    onClick={() => handleStepComplete(state.currentStep)}
                    disabled={state.submitting}
                    className='rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:opacity-50'
                  >
                    {state.submitting ? 'Creating...' : 'Create & Next'}
                  </button>
                ) : (
                  <button
                    onClick={handleFinishWizard}
                    className='rounded-lg bg-green-500 px-6 py-2 text-white hover:bg-green-600'
                  >
                    Finish Setup
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      />
      <Modal
        open={state.showEditModal}
        close={handleCloseModal}
        addHeader='Update Institution'
        renderComponent={() => (
          <div className='w-full max-w-4xl'>
            {/* Progress Header */}

            {/* Step Content */}
            <div className='min-h-[400px]'>
              <div className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <TextInput
                    title='Institution Name'
                    placeholder='Enter institution name'
                    value={state.institution_name}
                    onChange={e =>
                      handleFormChange('institution_name', e.target.value)
                    }
                    error={state.errors.institution_name}
                    required
                  />
                  <TextInput
                    title='Institution Code'
                    placeholder='Enter unique code'
                    value={state.institution_code}
                    onChange={e =>
                      handleFormChange('institution_code', e.target.value)
                    }
                    error={state.errors.institution_code}
                    required
                  />
                </div>
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <TextInput
                    title='Email Address'
                    type='email'
                    placeholder='institution@example.com'
                    value={state.institution_email}
                    onChange={e =>
                      handleFormChange('institution_email', e.target.value)
                    }
                    error={state.errors.institution_email}
                    required
                  />
                  <CustomPhoneInput
                    title='Phone Number'
                    value={state.institution_phone}
                    onChange={value =>
                      handleFormChange('institution_phone', value)
                    }
                    error={state.errors.institution_phone}
                    required
                  />
                </div>
                <TextArea
                  title='Complete Address'
                  placeholder='Enter the full address'
                  value={state.address}
                  onChange={e => handleFormChange('address', e.target.value)}
                  error={state.errors.address}
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Navigation Footer */}
            <div className='flex justify-end border-t p-6'>
              <div className='flex gap-2'>
                <button
                  onClick={() => handleCloseModal()}
                  className='rounded-lg border px-6 py-2  hover:bg-green-600'
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate()}
                  className='rounded-lg bg-green-500 px-6 py-2 text-white hover:bg-green-600'
                >
                  {state.btnLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  )
}

export default Institution