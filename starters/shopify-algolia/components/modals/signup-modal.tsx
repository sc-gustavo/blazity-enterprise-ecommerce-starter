import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { getCurrentUser, signupUser } from "app/actions/user.actions"
import { Button } from "components/ui/button-old"
import { DialogFooter } from "components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "components/ui/form"
import { GenericModal } from "components/generic-modal"
import { Input } from "components/ui/input"
import { Logo } from "components/logo"
import { useModalStore } from "stores/modal-store"
import { useUserStore } from "stores/user-store"

const passwordRegexp = new RegExp(/(?=.*\d)(?=.*\W)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/)

const formSchema = z.object({
  email: z.string().email().min(3).max(64),
  password: z.string().min(8).max(20).regex(passwordRegexp, "Password must have at least one number, one symbol, one uppercase letter, and be at least 8 characters"),
})

const formFields = [
  { label: "Email", name: "email", type: "text", placeholder: "Enter email..." },
  { label: "Password", name: "password", type: "password", placeholder: "Enter password..." },
] as const

export function SignupModal() {
  const modals = useModalStore((s) => s.modals)
  const setUser = useUserStore((s) => s.setUser)
  const closeModal = useModalStore((s) => s.closeModal)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(payload: z.infer<typeof formSchema>) {
    const { email, password } = payload
    const user = await signupUser({ email, password })

    if (user) {
      const currentUser = await getCurrentUser()
      currentUser && setUser(currentUser)

      closeModal("signup")
      toast.success("You have successfully signed up! You can now log in.")
      return
    }

    toast.error("Couldn't create user. The email address may be already in use.")
  }

  return (
    <GenericModal title="Signup" open={!!modals["signup"]} onOpenChange={() => closeModal("signup")}>
      <Form {...form}>
        <Logo className="mt-6 flex size-24 w-full justify-center" />
        {form.formState.errors.root?.message && <p className="mt-6 w-full text-[14px] leading-tight tracking-tight text-red-400">{form.formState.errors.root?.message}</p>}
        <form name="loginForm" id="loginForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          {formFields.map((singleField) => (
            <FormField
              key={singleField.name}
              control={form.control}
              name={singleField.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{singleField.label}</FormLabel>
                  <FormControl>
                    <Input type={singleField.type} className="text-sm" placeholder={singleField.placeholder} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-normal text-red-400" />
                </FormItem>
              )}
            />
          ))}
        </form>
      </Form>

      <DialogFooter>
        <Button
          size="lg"
          form="loginForm"
          className="hover:text-white"
          variant="secondary"
          isAnimated={false}
          type="submit"
          disabled={form.formState.isSubmitting}
          isLoading={form.formState.isSubmitting}
        >
          Submit
        </Button>
      </DialogFooter>
    </GenericModal>
  )
}
