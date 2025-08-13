const ScrollArea = ({ children, className = "", ...props }) => {
  return (
    <div className={`relative overflow-hidden ${className}`} {...props}>
      <div className="h-full w-full overflow-auto scrollbar-thin scrollbar-track-[#313244] scrollbar-thumb-[#45475a] hover:scrollbar-thumb-[#585b70]">
        {children}
      </div>
    </div>
  )
}

export { ScrollArea }