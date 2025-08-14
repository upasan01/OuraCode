const ScrollArea = ({ children, className = "", ...props }) => {
  return (
    <div className={`relative overflow-hidden ${className}`} {...props}>
      <div 
        className="h-full w-full overflow-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none', 
        }}
      >
        {children}
      </div>
    </div>
  )
}

export { ScrollArea }
