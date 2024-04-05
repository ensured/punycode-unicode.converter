"use client"

import { ReactNode, useState } from "react"
import { Label } from "@radix-ui/react-label"
import { Bookmark, BookmarkPlus, StarIcon } from "lucide-react"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"

const FavoritesSheet = ({
  children,
  setOpen,
  isOpen,
}: {
  children: ReactNode
  setOpen: (isOpen: boolean) => void // Add setOpen to the props interface
  isOpen: boolean
}) => {
  return (
    <div className="flex">
      <Sheet key={"right"} open={isOpen} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="flex gap-1" onClick={() => setOpen(!isOpen)}>
            <Bookmark className="h-4 w-4" /> Favorites
          </Button>
        </SheetTrigger>
        <SheetContent side={"right"}>
          <SheetHeader>
            <SheetTitle>
              <div className="flex select-none items-center justify-center gap-1 p-2">
                Favorites <StarIcon size={20} color="#FFD700" />
              </div>
            </SheetTitle>
          </SheetHeader>

          {children}

          {/* <SheetFooter>
             <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetFooter> */}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default FavoritesSheet
